export interface BitbucketPullRequest {
  id: number;
  title: string;
  description: string;
  state: string;
  links: {
    html: {
      href: string;
    };
  };
  source: {
    branch: {
      name: string;
    };
    repository: {
      full_name: string;
    };
  };
  destination: {
    branch: {
      name: string;
    };
  };
}

export interface BitbucketWebhookPayload {
  pullrequest: BitbucketPullRequest;
  repository: {
    full_name: string;
  };
  actor: {
    display_name: string;
  };
} 