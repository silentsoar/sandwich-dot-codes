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
    commitMessages?: string[];
    releaseTag?: string;
  };
}

export interface LanguageStat {
  name: string;
  bytes: number;
  percentage: number;
}

const GITHUB_USERNAME = "silentsoar";

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

      if (event.type === "PushEvent") {
        const commits = event.payload?.commits;
        const ref: string = event.payload?.ref ?? "";
        const branch = ref.replace("refs/heads/", "");

        if (commits?.length > 0) {
          const latestMessage = commits[commits.length - 1]?.message?.split("\n")[0] ?? "";
          const sha = commits[commits.length - 1]?.sha?.substring(0, 7) ?? "";
          const messages = commits.map((c: { message: string }) => c.message.split("\n")[0]);

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
              commitMessages: messages,
            },
          });
        } else {
          const headSha: string = event.payload?.head ?? "";
          let title = `Pushed to ${branch}`;
          const commitMessages: string[] = [];

          if (headSha) {
            try {
              const commitRes = await fetch(
                `https://api.github.com/repos/${event.repo.name}/commits/${headSha}`,
                { headers: githubHeaders, next: { revalidate: 60 } },
              );
              if (commitRes.ok) {
                const commitData = await commitRes.json();
                const msg = commitData.commit?.message?.split("\n")[0];
                if (msg) {
                  title = msg;
                  commitMessages.push(msg);
                }
              }
            } catch {
              // fall back to "Pushed to branch"
            }
          }

          timeline.push({
            id: event.id,
            type: "commit",
            title,
            url: headSha
              ? `https://github.com/${event.repo.name}/commit/${headSha}`
              : `https://github.com/${event.repo.name}`,
            repo: repoName,
            date: event.created_at,
            meta: {
              commitSha: headSha.substring(0, 7),
              commitCount: 1,
              commitMessages,
            },
          });
        }
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

    return timeline
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  } catch {
    return [];
  }
}

export async function fetchWeeklyCommitCount(): Promise<number> {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const since = oneWeekAgo.toISOString();

    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed&type=all`,
      {
        headers: githubHeaders,
        next: { revalidate: 3600 },
      },
    );

    if (!reposRes.ok) return 0;
    const repos: { name: string; fork: boolean; pushed_at: string }[] = await reposRes.json();

    const recentlyPushed = repos.filter(
      (r) => !r.fork && new Date(r.pushed_at) >= oneWeekAgo,
    );

    const counts = await Promise.allSettled(
      recentlyPushed.map((repo) =>
        fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/commits?since=${since}&per_page=100`,
          { headers: githubHeaders, next: { revalidate: 3600 } },
        ).then((res) => (res.ok ? res.json() : [])),
      ),
    );

    let total = 0;
    for (const result of counts) {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        total += result.value.length;
      }
    }

    return total;
  } catch {
    return 0;
  }
}

export async function fetchGitHubLanguages(): Promise<LanguageStat[]> {
  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&type=all`,
      {
        headers: githubHeaders,
        next: { revalidate: 3600 },
      },
    );

    if (!reposRes.ok) return [];
    const repos: { name: string; fork: boolean }[] = await reposRes.json();

    const languageTotals: Record<string, number> = {};

    const languageResults = await Promise.allSettled(
      repos
        .filter((r) => !r.fork)
        .map((repo) =>
          fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/languages`,
            {
              headers: githubHeaders,
              next: { revalidate: 3600 },
            },
          ).then((res) => (res.ok ? res.json() : {})),
        ),
    );

    for (const result of languageResults) {
      if (result.status === "fulfilled") {
        const langs = result.value as Record<string, number>;
        for (const [lang, bytes] of Object.entries(langs)) {
          languageTotals[lang] = (languageTotals[lang] ?? 0) + bytes;
        }
      }
    }

    const totalBytes = Object.values(languageTotals).reduce((a, b) => a + b, 0);
    if (totalBytes === 0) return [];

    return Object.entries(languageTotals)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: Math.round((bytes / totalBytes) * 1000) / 10,
      }))
      .sort((a, b) => b.bytes - a.bytes);
  } catch {
    return [];
  }
}
