import { fetchGitHubTimeline } from "@/lib/github";
import { GitHubSectionClient } from "./GitHubSectionClient";

export async function GitHubSection() {
  const timeline = await fetchGitHubTimeline();

  return <GitHubSectionClient initialTimeline={timeline} />;
}
