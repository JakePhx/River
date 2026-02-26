export type FollowTargetResponseDTO = {
  ok: true;
};

export type UnFollowTargetResponseDTO = {
  ok: true;
};

export type CancelFollowResponseDTO = {
  ok: true;
};

export type FollowTargetErrorResponseDTO = {
  error: {
    code: string;
    message: string;
  };
};

export type UnFollowTargetErrorResponseDTO = {
  error: {
    code: string;
    message: string;
  };
};

export type CancelFollowErrorResponseDTO = {
  error: {
    code: string;
    message: string;
  };
};
