export type AcceptFollowResponseDTO = {
  ok: true;
};

export type RejectFollowResponseDTO = {
  ok: true;
};

export type AcceptFollowErrorResponseDTO = {
  error: {
    code: string;
    message: string;
  };
};

export type RejectFollowErrorResponseDTO = {
  error: {
    code: string;
    message: string;
  };
};
