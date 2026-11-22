from rest_framework.response import Response
from rest_framework.views import APIView

from apps.public_api import PublicReadOnlyMixin
from apps.services.models import ProcessStep
from apps.services.serializers import ProcessStepSerializer

from .models import Certification, Education, Experience, Profile, Skill, SocialLink
from .serializers import (
    CertificationSerializer,
    EducationSerializer,
    ExperienceSerializer,
    ProfileSerializer,
    SkillSerializer,
    SocialLinkSerializer,
)


class SiteContentView(PublicReadOnlyMixin, APIView):
    """Everything the layout and homepage need besides projects and services, in one request."""

    def get(self, request):
        return Response(
            {
                "profile": ProfileSerializer(Profile.load()).data,
                "social_links": SocialLinkSerializer(SocialLink.objects.all(), many=True).data,
                "skills": SkillSerializer(Skill.objects.all(), many=True).data,
                "experience": ExperienceSerializer(Experience.objects.all(), many=True).data,
                "education": EducationSerializer(Education.objects.all(), many=True).data,
                "certifications": CertificationSerializer(Certification.objects.all(), many=True).data,
                "process_steps": ProcessStepSerializer(ProcessStep.objects.all(), many=True).data,
            }
        )
