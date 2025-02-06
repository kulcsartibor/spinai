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
  owner?: string;
  repo?: string;
  pull_number?: number;
  reviews?: FileReview[];
  botName?: string;
}
