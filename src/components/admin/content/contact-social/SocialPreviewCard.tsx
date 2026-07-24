import { Card } from "@/components/common/Card";
import type { SocialLinksData } from "@/services/social-links.service";

interface SocialPreviewCardProps {
  data: SocialLinksData;
}

export function SocialPreviewCard({ data }: SocialPreviewCardProps) {
  const enabled = data.links.filter((l) => l.enabled && l.url);
  const disabled = data.links.filter((l) => !l.enabled || !l.url);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Active Social Platforms ({enabled.length})
        </p>
      </div>

      {enabled.length === 0 ? (
        <p className="px-5 py-6 text-sm italic text-muted-foreground">
          No social platforms enabled yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3 px-5 py-4">
          {enabled.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <i className={`fa-brands ${link.faIcon} text-base`} aria-hidden="true" />
              {link.label}
            </a>
          ))}
        </div>
      )}

      {disabled.length > 0 && (
        <div className="border-t border-border px-5 py-3">
          <p className="mb-2 text-xs text-muted-foreground">
            Disabled ({disabled.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {disabled.map((link) => (
              <span
                key={link.platform}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                <i className={`fa-brands ${link.faIcon}`} aria-hidden="true" />
                {link.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
