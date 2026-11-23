import { Link } from "react-router";
import { useSiteContent } from "@/app/site-content";
import { primaryNav } from "@/content/site";
import { useConsent } from "@/features/consent/useConsent";
import { displayName } from "@/lib/display";

export function Footer() {
  const { profile, social_links: socials } = useSiteContent();
  const consent = useConsent();
  const name = displayName(profile);
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line py-12 text-sm text-muted">
      <div className="container-page grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-display text-base font-semibold text-fg">
            {name}
            <span className="text-primary-text">.</span>
          </p>
          <p className="mt-2 max-w-xs">{profile.headline}</p>
          {profile.email_public && (
            <a className="mt-4 inline-block" href={`mailto:${profile.email_public}`}>
              {profile.email_public}
            </a>
          )}
        </div>

        <nav aria-label="Footer">
          <p className="label-mono text-muted">Site</p>
          <ul className="mt-3 space-y-2">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <Link className="text-fg-secondary no-underline hover:text-fg" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="text-fg-secondary no-underline hover:text-fg" to="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="label-mono text-muted">Elsewhere</p>
          <ul className="mt-3 space-y-2">
            {socials.map((social) => (
              <li key={social.url}>
                <a
                  className="text-fg-secondary no-underline hover:text-fg"
                  href={social.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {social.platform}
                </a>
              </li>
            ))}
            <li>
              <Link className="text-fg-secondary no-underline hover:text-fg" to="/privacy">
                Privacy policy
              </Link>
            </li>
            {consent.enabled && (
              <li>
                <button
                  type="button"
                  className="text-fg-secondary hover:text-fg"
                  onClick={consent.openSettings}
                >
                  Cookie settings
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="container-page mt-10">
        <p>
          © {year} {name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
