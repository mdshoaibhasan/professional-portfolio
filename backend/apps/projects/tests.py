from django.test import TestCase

from .models import CaseStudyPoint, CaseStudySection, Project, ProjectSpec


def make_project(slug="demo", **fields) -> Project:
    defaults = dict(title="Demo", summary="A demo.", status=Project.Status.LIVE, is_published=True)
    return Project.objects.create(slug=slug, **{**defaults, **fields})


class ProjectApiTests(TestCase):
    def test_unpublished_projects_are_hidden(self):
        make_project("shown")
        make_project("draft", is_published=False)
        slugs = [p["slug"] for p in self.client.get("/api/v1/projects/").json()]
        self.assertEqual(slugs, ["shown"])
        self.assertEqual(self.client.get("/api/v1/projects/draft/").status_code, 404)

    def test_unknown_project_is_404(self):
        self.assertEqual(self.client.get("/api/v1/projects/nope/").status_code, 404)

    def test_ordering_and_nested_order(self):
        make_project("b", order=2)
        project = make_project("a", order=1)
        ProjectSpec.objects.create(project=project, label="Second", order=2)
        ProjectSpec.objects.create(project=project, label="First", value="x", order=1)
        later = CaseStudySection.objects.create(project=project, anchor="later", title="Later", order=2)
        first = CaseStudySection.objects.create(
            project=project, anchor="first", title="First", body="One.\n\nTwo.", order=1
        )
        CaseStudyPoint.objects.create(section=first, title="P2", text="t", order=2)
        CaseStudyPoint.objects.create(section=first, title="P1", text="t", order=1)

        self.assertEqual([p["slug"] for p in self.client.get("/api/v1/projects/").json()], ["a", "b"])
        data = self.client.get("/api/v1/projects/a/").json()
        self.assertEqual(
            data["specs"], [{"label": "First", "value": "x"}, {"label": "Second", "value": None}]
        )
        self.assertEqual([s["id"] for s in data["sections"]], ["first", later.anchor])
        self.assertEqual(data["sections"][0]["body"], ["One.", "Two."])
        self.assertEqual([p["title"] for p in data["sections"][0]["points"]], ["P1", "P2"])

    def test_detail_uses_constant_number_of_queries(self):
        project = make_project()
        for i in range(3):
            section = CaseStudySection.objects.create(project=project, anchor=f"s{i}", title="S", order=i)
            CaseStudyPoint.objects.create(section=section, title="P", text="t")
        with self.assertNumQueries(4):  # project, specs, sections, points
            self.client.get("/api/v1/projects/demo/")

    def test_read_only(self):
        make_project()
        self.assertEqual(self.client.post("/api/v1/projects/", {}).status_code, 405)
        self.assertEqual(self.client.delete("/api/v1/projects/demo/").status_code, 405)
