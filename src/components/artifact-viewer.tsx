import { FileJson, FileText } from "lucide-react";
import type { ArtifactRef } from "@/lib/contracts";
import { dictionaries, type Locale } from "@/lib/i18n";

type ArtifactViewerProps = {
  artifacts: ArtifactRef[];
  locale: Locale;
};

export function ArtifactViewer({ artifacts, locale }: ArtifactViewerProps) {
  const dictionary = dictionaries[locale];
  if (artifacts.length === 0) return <p className="muted">{dictionary.noArtifacts}</p>;
  return (
    <div className="artifact-list">
      {artifacts.map((artifact) => {
        const Icon = artifact.content_type.includes("json") ? FileJson : FileText;
        return (
          <div className="artifact-row" key={`${artifact.kind}-${artifact.path_or_url}`}>
            <Icon size={18} />
            <div>
              <strong>{artifact.kind}</strong>
              <span>{artifact.path_or_url}</span>
            </div>
            <span className="muted">{artifact.content_type}</span>
          </div>
        );
      })}
    </div>
  );
}
