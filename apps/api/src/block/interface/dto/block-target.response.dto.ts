export type BlockTargetResponseDTO = {
  ok: boolean;
};

export type UnBlockTargetResponseDTO = {
  ok: boolean;
};

export type BlockTargetErrorResponseDTO = {
  error: {
    code: string;
    message: string;
  };
};

export type UnBlockTargetErrorResponseDTO = {
  error: {
    code: string;
    message: string;
  };
};
