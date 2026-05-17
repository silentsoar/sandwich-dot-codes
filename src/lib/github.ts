export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  topics: string[];
  homepage?: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  html_url: string;
  date: string;
  repo: string;
}

export type TimelineEventType = "commit" | "pull_request" | "release";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  url: string;
  repo: string;
  date: string;
  meta?: {
    prNumber?: number;
    prAction?: string;
    commitSha?: string;
    commitCount?: number;
    releaseTag?: string;
  };
}

const GITHUB_USERNAME = "sandwich-codes";

const githubHeaders = {
  Accept: "application/vnd.github.v3+json",
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`,
      {
        headers: githubHeaders,
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchRecentCommits(): Promise<GitHubCommit[]> {
  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=3`,
      {
        headers: githubHeaders,
        next: { revalidate: 3600 },
      },
    );

    if (!reposRes.ok) return [];
    const repos = await reposRes.json();

    const commits: GitHubCommit[] = [];

    for (const repo of repos.slice(0, 3)) {
      try {
        const commitsRes = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/commits?per_page=2`,
          {
            headers: githubHeaders,
            next: { revalidate: 3600 },
          },
        );

        if (commitsRes.ok) {
          const repoCommits = await commitsRes.json();
          for (const commit of repoCommits) {
            commits.push({
              sha: commit.sha.substring(0, 7),
              message: commit.commit.message.split("\n")[0],
              html_url: commit.html_url,
              date: commit.commit.author.date,
              repo: repo.name,
            });
          }
        }
      } catch {
        // Skip this repo
      }
    }

    return commits
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  } catch {
    return [];
  }
}

export async function fetchGitHubTimeline(): Promise<TimelineEvent[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`,
      {
        headers: githubHeaders,
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) return [];
    const events = await res.json();

    const timeline: TimelineEvent[] = [];

    for (const event of events) {
      const repoName: string = event.repo?.name?.split("/")[1] ?? event.repo?.name ?? "unknown";

      if (event.type === "PushEvent" && event.payload?.commits?.length > 0) {
        const commits = event.payload.commits;
        const latestMessage = commits[commits.length - 1]?.message?.split("\n")[0] ?? "";
        const sha = commits[commits.length - 1]?.sha?.substring(0, 7) ?? "";

        timeline.push({
          id: event.id,
          type: "commit",
          title: commits.length === 1
            ? latestMessage
            : `Pushed ${commits.length} commits`,
          url: `https://github.com/${event.repo.name}/commit/${commits[commits.length - 1]?.sha}`,
          repo: repoName,
          date: event.created_at,
          meta: {
            commitSha: sha,
            commitCount: commits.length,
          },
        });
      } else if (event.type === "PullRequestEvent" && event.payload?.pull_request) {
        const pr = event.payload.pull_request;
        timeline.push({
          id: event.id,
          type: "pull_request",
          title: pr.title,
          url: pr.html_url,
          repo: repoName,
          date: event.created_at,
          meta: {
            prNumber: pr.number,
            prAction: event.payload.action,
          },
        });
      } else if (event.type === "ReleaseEvent" && event.payload?.release) {
        const release = event.payload.release;
        timeline.push({
          id: event.id,
          type: "release",
          title: release.name || release.tag_name,
          url: release.html_url,
          repo: repoName,
          date: event.created_at,
          meta: {
            releaseTag: release.tag_name,
          },
        });
      }
    }

    return timeline.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  } catch {
    return [];
  }
}
