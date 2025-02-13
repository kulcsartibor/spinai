import { createDocUpdateAgent } from "./index";
import * as path from "path";

// Mock PR payload from a real GitHub webhook
const mockPayload = {
  action: "opened",
  number: 6,
  pull_request: {
    url: "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls/6",
    id: 2334097408,
    node_id: "PR_kwDON5B2Ts6LH4AA",
    html_url: "https://github.com/AtotheY/mintlify-pr-test/pull/6",
    diff_url: "https://github.com/AtotheY/mintlify-pr-test/pull/6.diff",
    patch_url: "https://github.com/AtotheY/mintlify-pr-test/pull/6.patch",
    issue_url: "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues/6",
    number: 6,
    state: "open",
    locked: false,
    title: "adding cloud flare and http models",
    user: {
      login: "AtotheY",
      id: 10644934,
      node_id: "MDQ6VXNlcjEwNjQ0OTM0",
      avatar_url: "https://avatars.githubusercontent.com/u/10644934?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/AtotheY",
      html_url: "https://github.com/AtotheY",
      followers_url: "https://api.github.com/users/AtotheY/followers",
      following_url:
        "https://api.github.com/users/AtotheY/following{/other_user}",
      gists_url: "https://api.github.com/users/AtotheY/gists{/gist_id}",
      starred_url:
        "https://api.github.com/users/AtotheY/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/AtotheY/subscriptions",
      organizations_url: "https://api.github.com/users/AtotheY/orgs",
      repos_url: "https://api.github.com/users/AtotheY/repos",
      events_url: "https://api.github.com/users/AtotheY/events{/privacy}",
      received_events_url:
        "https://api.github.com/users/AtotheY/received_events",
      type: "User",
      user_view_type: "public",
      site_admin: false,
    },
    body: null,
    created_at: "2025-02-13T15:24:29Z",
    updated_at: "2025-02-13T15:24:29Z",
    closed_at: null,
    merged_at: null,
    merge_commit_sha: null,
    assignee: null,
    assignees: [],
    requested_reviewers: [],
    requested_teams: [],
    labels: [],
    milestone: null,
    draft: false,
    commits_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls/6/commits",
    review_comments_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls/6/comments",
    review_comment_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls/comments{/number}",
    comments_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues/6/comments",
    statuses_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/statuses/a8de223cf5fc81fdb6aa382e80c15d30ca06ff83",
    head: {
      label: "AtotheY:feature/adding-clourdflare-and-http-models",
      ref: "feature/adding-clourdflare-and-http-models",
      sha: "a8de223cf5fc81fdb6aa382e80c15d30ca06ff83",
      user: {
        login: "AtotheY",
        id: 10644934,
        node_id: "MDQ6VXNlcjEwNjQ0OTM0",
        avatar_url: "https://avatars.githubusercontent.com/u/10644934?v=4",
        gravatar_id: "",
        url: "https://api.github.com/users/AtotheY",
        html_url: "https://github.com/AtotheY",
        followers_url: "https://api.github.com/users/AtotheY/followers",
        following_url:
          "https://api.github.com/users/AtotheY/following{/other_user}",
        gists_url: "https://api.github.com/users/AtotheY/gists{/gist_id}",
        starred_url:
          "https://api.github.com/users/AtotheY/starred{/owner}{/repo}",
        subscriptions_url: "https://api.github.com/users/AtotheY/subscriptions",
        organizations_url: "https://api.github.com/users/AtotheY/orgs",
        repos_url: "https://api.github.com/users/AtotheY/repos",
        events_url: "https://api.github.com/users/AtotheY/events{/privacy}",
        received_events_url:
          "https://api.github.com/users/AtotheY/received_events",
        type: "User",
        user_view_type: "public",
        site_admin: false,
      },
      repo: {
        id: 932214350,
        node_id: "R_kgDON5B2Tg",
        name: "mintlify-pr-test",
        full_name: "AtotheY/mintlify-pr-test",
        private: false,
        owner: {
          login: "AtotheY",
          id: 10644934,
          node_id: "MDQ6VXNlcjEwNjQ0OTM0",
          avatar_url: "https://avatars.githubusercontent.com/u/10644934?v=4",
          gravatar_id: "",
          url: "https://api.github.com/users/AtotheY",
          html_url: "https://github.com/AtotheY",
          followers_url: "https://api.github.com/users/AtotheY/followers",
          following_url:
            "https://api.github.com/users/AtotheY/following{/other_user}",
          gists_url: "https://api.github.com/users/AtotheY/gists{/gist_id}",
          starred_url:
            "https://api.github.com/users/AtotheY/starred{/owner}{/repo}",
          subscriptions_url:
            "https://api.github.com/users/AtotheY/subscriptions",
          organizations_url: "https://api.github.com/users/AtotheY/orgs",
          repos_url: "https://api.github.com/users/AtotheY/repos",
          events_url: "https://api.github.com/users/AtotheY/events{/privacy}",
          received_events_url:
            "https://api.github.com/users/AtotheY/received_events",
          type: "User",
          user_view_type: "public",
          site_admin: false,
        },
        html_url: "https://github.com/AtotheY/mintlify-pr-test",
        description: null,
        fork: true,
        url: "https://api.github.com/repos/AtotheY/mintlify-pr-test",
        forks_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/forks",
        keys_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/keys{/key_id}",
        collaborators_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/collaborators{/collaborator}",
        teams_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/teams",
        hooks_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/hooks",
        issue_events_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues/events{/number}",
        events_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/events",
        assignees_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/assignees{/user}",
        branches_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/branches{/branch}",
        tags_url: "https://api.github.com/repos/AtotheY/mintlify-pr-test/tags",
        blobs_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/blobs{/sha}",
        git_tags_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/tags{/sha}",
        git_refs_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/refs{/sha}",
        trees_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/trees{/sha}",
        statuses_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/statuses/{sha}",
        languages_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/languages",
        stargazers_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/stargazers",
        contributors_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/contributors",
        subscribers_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/subscribers",
        subscription_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/subscription",
        commits_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/commits{/sha}",
        git_commits_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/commits{/sha}",
        comments_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/comments{/number}",
        issue_comment_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues/comments{/number}",
        contents_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/contents/{+path}",
        compare_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/compare/{base}...{head}",
        merges_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/merges",
        archive_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/{archive_format}{/ref}",
        downloads_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/downloads",
        issues_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues{/number}",
        pulls_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls{/number}",
        milestones_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/milestones{/number}",
        notifications_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/notifications{?since,all,participating}",
        labels_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/labels{/name}",
        releases_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/releases{/id}",
        deployments_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/deployments",
        created_at: "2025-02-13T14:58:47Z",
        updated_at: "2025-02-13T14:58:47Z",
        pushed_at: "2025-02-12T22:47:52Z",
        git_url: "git://github.com/AtotheY/mintlify-pr-test.git",
        ssh_url: "git@github.com:AtotheY/mintlify-pr-test.git",
        clone_url: "https://github.com/AtotheY/mintlify-pr-test.git",
        svn_url: "https://github.com/AtotheY/mintlify-pr-test",
        homepage: "https://docs.spinai.dev",
        size: 2359,
        stargazers_count: 0,
        watchers_count: 0,
        language: null,
        has_issues: false,
        has_projects: true,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        has_discussions: false,
        forks_count: 0,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 1,
        license: null,
        allow_forking: true,
        is_template: false,
        web_commit_signoff_required: false,
        topics: [],
        visibility: "public",
        forks: 0,
        open_issues: 1,
        watchers: 0,
        default_branch: "main",
        allow_squash_merge: true,
        allow_merge_commit: true,
        allow_rebase_merge: true,
        allow_auto_merge: false,
        delete_branch_on_merge: false,
        allow_update_branch: false,
        use_squash_pr_title_as_default: false,
        squash_merge_commit_message: "COMMIT_MESSAGES",
        squash_merge_commit_title: "COMMIT_OR_PR_TITLE",
        merge_commit_message: "PR_TITLE",
        merge_commit_title: "MERGE_MESSAGE",
      },
    },
    base: {
      label: "AtotheY:main",
      ref: "main",
      sha: "4c007779f1958b872a3e72efc78147dce3a2583b",
      user: {
        login: "AtotheY",
        id: 10644934,
        node_id: "MDQ6VXNlcjEwNjQ0OTM0",
        avatar_url: "https://avatars.githubusercontent.com/u/10644934?v=4",
        gravatar_id: "",
        url: "https://api.github.com/users/AtotheY",
        html_url: "https://github.com/AtotheY",
        followers_url: "https://api.github.com/users/AtotheY/followers",
        following_url:
          "https://api.github.com/users/AtotheY/following{/other_user}",
        gists_url: "https://api.github.com/users/AtotheY/gists{/gist_id}",
        starred_url:
          "https://api.github.com/users/AtotheY/starred{/owner}{/repo}",
        subscriptions_url: "https://api.github.com/users/AtotheY/subscriptions",
        organizations_url: "https://api.github.com/users/AtotheY/orgs",
        repos_url: "https://api.github.com/users/AtotheY/repos",
        events_url: "https://api.github.com/users/AtotheY/events{/privacy}",
        received_events_url:
          "https://api.github.com/users/AtotheY/received_events",
        type: "User",
        user_view_type: "public",
        site_admin: false,
      },
      repo: {
        id: 932214350,
        node_id: "R_kgDON5B2Tg",
        name: "mintlify-pr-test",
        full_name: "AtotheY/mintlify-pr-test",
        private: false,
        owner: {
          login: "AtotheY",
          id: 10644934,
          node_id: "MDQ6VXNlcjEwNjQ0OTM0",
          avatar_url: "https://avatars.githubusercontent.com/u/10644934?v=4",
          gravatar_id: "",
          url: "https://api.github.com/users/AtotheY",
          html_url: "https://github.com/AtotheY",
          followers_url: "https://api.github.com/users/AtotheY/followers",
          following_url:
            "https://api.github.com/users/AtotheY/following{/other_user}",
          gists_url: "https://api.github.com/users/AtotheY/gists{/gist_id}",
          starred_url:
            "https://api.github.com/users/AtotheY/starred{/owner}{/repo}",
          subscriptions_url:
            "https://api.github.com/users/AtotheY/subscriptions",
          organizations_url: "https://api.github.com/users/AtotheY/orgs",
          repos_url: "https://api.github.com/users/AtotheY/repos",
          events_url: "https://api.github.com/users/AtotheY/events{/privacy}",
          received_events_url:
            "https://api.github.com/users/AtotheY/received_events",
          type: "User",
          user_view_type: "public",
          site_admin: false,
        },
        html_url: "https://github.com/AtotheY/mintlify-pr-test",
        description: null,
        fork: true,
        url: "https://api.github.com/repos/AtotheY/mintlify-pr-test",
        forks_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/forks",
        keys_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/keys{/key_id}",
        collaborators_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/collaborators{/collaborator}",
        teams_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/teams",
        hooks_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/hooks",
        issue_events_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues/events{/number}",
        events_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/events",
        assignees_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/assignees{/user}",
        branches_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/branches{/branch}",
        tags_url: "https://api.github.com/repos/AtotheY/mintlify-pr-test/tags",
        blobs_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/blobs{/sha}",
        git_tags_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/tags{/sha}",
        git_refs_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/refs{/sha}",
        trees_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/trees{/sha}",
        statuses_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/statuses/{sha}",
        languages_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/languages",
        stargazers_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/stargazers",
        contributors_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/contributors",
        subscribers_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/subscribers",
        subscription_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/subscription",
        commits_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/commits{/sha}",
        git_commits_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/commits{/sha}",
        comments_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/comments{/number}",
        issue_comment_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues/comments{/number}",
        contents_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/contents/{+path}",
        compare_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/compare/{base}...{head}",
        merges_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/merges",
        archive_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/{archive_format}{/ref}",
        downloads_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/downloads",
        issues_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues{/number}",
        pulls_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls{/number}",
        milestones_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/milestones{/number}",
        notifications_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/notifications{?since,all,participating}",
        labels_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/labels{/name}",
        releases_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/releases{/id}",
        deployments_url:
          "https://api.github.com/repos/AtotheY/mintlify-pr-test/deployments",
        created_at: "2025-02-13T14:58:47Z",
        updated_at: "2025-02-13T14:58:47Z",
        pushed_at: "2025-02-12T22:47:52Z",
        git_url: "git://github.com/AtotheY/mintlify-pr-test.git",
        ssh_url: "git@github.com:AtotheY/mintlify-pr-test.git",
        clone_url: "https://github.com/AtotheY/mintlify-pr-test.git",
        svn_url: "https://github.com/AtotheY/mintlify-pr-test",
        homepage: "https://docs.spinai.dev",
        size: 2359,
        stargazers_count: 0,
        watchers_count: 0,
        language: null,
        has_issues: false,
        has_projects: true,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        has_discussions: false,
        forks_count: 0,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 1,
        license: null,
        allow_forking: true,
        is_template: false,
        web_commit_signoff_required: false,
        topics: [],
        visibility: "public",
        forks: 0,
        open_issues: 1,
        watchers: 0,
        default_branch: "main",
        allow_squash_merge: true,
        allow_merge_commit: true,
        allow_rebase_merge: true,
        allow_auto_merge: false,
        delete_branch_on_merge: false,
        allow_update_branch: false,
        use_squash_pr_title_as_default: false,
        squash_merge_commit_message: "COMMIT_MESSAGES",
        squash_merge_commit_title: "COMMIT_OR_PR_TITLE",
        merge_commit_message: "PR_TITLE",
        merge_commit_title: "MERGE_MESSAGE",
      },
    },
    _links: {
      self: {
        href: "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls/6",
      },
      html: {
        href: "https://github.com/AtotheY/mintlify-pr-test/pull/6",
      },
      issue: {
        href: "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues/6",
      },
      comments: {
        href: "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues/6/comments",
      },
      review_comments: {
        href: "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls/6/comments",
      },
      review_comment: {
        href: "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls/comments{/number}",
      },
      commits: {
        href: "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls/6/commits",
      },
      statuses: {
        href: "https://api.github.com/repos/AtotheY/mintlify-pr-test/statuses/a8de223cf5fc81fdb6aa382e80c15d30ca06ff83",
      },
    },
    author_association: "OWNER",
    auto_merge: null,
    active_lock_reason: null,
    merged: false,
    mergeable: null,
    rebaseable: null,
    mergeable_state: "unknown",
    merged_by: null,
    comments: 0,
    review_comments: 0,
    maintainer_can_modify: false,
    commits: 1,
    additions: 208,
    deletions: 0,
    changed_files: 3,
  },
  repository: {
    id: 932214350,
    node_id: "R_kgDON5B2Tg",
    name: "mintlify-pr-test",
    full_name: "AtotheY/mintlify-pr-test",
    private: false,
    owner: {
      login: "AtotheY",
      id: 10644934,
      node_id: "MDQ6VXNlcjEwNjQ0OTM0",
      avatar_url: "https://avatars.githubusercontent.com/u/10644934?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/AtotheY",
      html_url: "https://github.com/AtotheY",
      followers_url: "https://api.github.com/users/AtotheY/followers",
      following_url:
        "https://api.github.com/users/AtotheY/following{/other_user}",
      gists_url: "https://api.github.com/users/AtotheY/gists{/gist_id}",
      starred_url:
        "https://api.github.com/users/AtotheY/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/AtotheY/subscriptions",
      organizations_url: "https://api.github.com/users/AtotheY/orgs",
      repos_url: "https://api.github.com/users/AtotheY/repos",
      events_url: "https://api.github.com/users/AtotheY/events{/privacy}",
      received_events_url:
        "https://api.github.com/users/AtotheY/received_events",
      type: "User",
      user_view_type: "public",
      site_admin: false,
    },
    html_url: "https://github.com/AtotheY/mintlify-pr-test",
    description: null,
    fork: true,
    url: "https://api.github.com/repos/AtotheY/mintlify-pr-test",
    forks_url: "https://api.github.com/repos/AtotheY/mintlify-pr-test/forks",
    keys_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/keys{/key_id}",
    collaborators_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/collaborators{/collaborator}",
    teams_url: "https://api.github.com/repos/AtotheY/mintlify-pr-test/teams",
    hooks_url: "https://api.github.com/repos/AtotheY/mintlify-pr-test/hooks",
    issue_events_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues/events{/number}",
    events_url: "https://api.github.com/repos/AtotheY/mintlify-pr-test/events",
    assignees_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/assignees{/user}",
    branches_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/branches{/branch}",
    tags_url: "https://api.github.com/repos/AtotheY/mintlify-pr-test/tags",
    blobs_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/blobs{/sha}",
    git_tags_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/tags{/sha}",
    git_refs_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/refs{/sha}",
    trees_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/trees{/sha}",
    statuses_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/statuses/{sha}",
    languages_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/languages",
    stargazers_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/stargazers",
    contributors_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/contributors",
    subscribers_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/subscribers",
    subscription_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/subscription",
    commits_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/commits{/sha}",
    git_commits_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/git/commits{/sha}",
    comments_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/comments{/number}",
    issue_comment_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues/comments{/number}",
    contents_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/contents/{+path}",
    compare_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/compare/{base}...{head}",
    merges_url: "https://api.github.com/repos/AtotheY/mintlify-pr-test/merges",
    archive_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/{archive_format}{/ref}",
    downloads_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/downloads",
    issues_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/issues{/number}",
    pulls_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/pulls{/number}",
    milestones_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/milestones{/number}",
    notifications_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/notifications{?since,all,participating}",
    labels_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/labels{/name}",
    releases_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/releases{/id}",
    deployments_url:
      "https://api.github.com/repos/AtotheY/mintlify-pr-test/deployments",
    created_at: "2025-02-13T14:58:47Z",
    updated_at: "2025-02-13T14:58:47Z",
    pushed_at: "2025-02-12T22:47:52Z",
    git_url: "git://github.com/AtotheY/mintlify-pr-test.git",
    ssh_url: "git@github.com:AtotheY/mintlify-pr-test.git",
    clone_url: "https://github.com/AtotheY/mintlify-pr-test.git",
    svn_url: "https://github.com/AtotheY/mintlify-pr-test",
    homepage: "https://docs.spinai.dev",
    size: 2359,
    stargazers_count: 0,
    watchers_count: 0,
    language: null,
    has_issues: false,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: false,
    has_discussions: false,
    forks_count: 0,
    mirror_url: null,
    archived: false,
    disabled: false,
    open_issues_count: 1,
    license: null,
    allow_forking: true,
    is_template: false,
    web_commit_signoff_required: false,
    topics: [],
    visibility: "public",
    forks: 0,
    open_issues: 1,
    watchers: 0,
    default_branch: "main",
  },
  sender: {
    login: "AtotheY",
    id: 10644934,
    node_id: "MDQ6VXNlcjEwNjQ0OTM0",
    avatar_url: "https://avatars.githubusercontent.com/u/10644934?v=4",
    gravatar_id: "",
    url: "https://api.github.com/users/AtotheY",
    html_url: "https://github.com/AtotheY",
    followers_url: "https://api.github.com/users/AtotheY/followers",
    following_url:
      "https://api.github.com/users/AtotheY/following{/other_user}",
    gists_url: "https://api.github.com/users/AtotheY/gists{/gist_id}",
    starred_url: "https://api.github.com/users/AtotheY/starred{/owner}{/repo}",
    subscriptions_url: "https://api.github.com/users/AtotheY/subscriptions",
    organizations_url: "https://api.github.com/users/AtotheY/orgs",
    repos_url: "https://api.github.com/users/AtotheY/repos",
    events_url: "https://api.github.com/users/AtotheY/events{/privacy}",
    received_events_url: "https://api.github.com/users/AtotheY/received_events",
    type: "User",
    user_view_type: "public",
    site_admin: false,
  },
};

async function testWebhook() {
  console.log("Starting test webhook...");

  const workspaceRoot = path.resolve(__dirname, "../../../");
  const docsDir = path.join(workspaceRoot, "apps/docs");

  console.log(`Using docs directory: ${docsDir}`);

  const agent = createDocUpdateAgent({
    config: {
      docsDir,
      matchRules: {
        pathMappings: {
          "packages/": "docs/api",
          "examples/": "docs/examples",
        },
      },
    },
  });

  // Simulate webhook request
  const response = await fetch("http://localhost:3000/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-GitHub-Event": "pull_request",
    },
    body: JSON.stringify(mockPayload),
  });

  const result = await response.json();
  console.log("\n=== Test Result ===");
  console.log(JSON.stringify(result, null, 2));
  console.log("==================\n");
}

// Run the test
testWebhook().catch(console.error);
