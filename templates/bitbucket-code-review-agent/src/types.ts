export interface ReviewFeedback {
  line: number;
  comment: string;
}

export interface ReviewResponse {
  feedback: ReviewFeedback[];
}

export interface FileReview {
  file: string;
  feedback: ReviewFeedback[];
}

export interface ReviewState {
  workspace?: string;
  repo_slug?: string;
  pull_request_id?: number;
  reviews?: FileReview[];
  botName?: string;
}
