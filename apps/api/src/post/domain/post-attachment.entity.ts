export type PostAttachmentKind = 'IMAGE' | 'VIDEO';

export type PostAttachmentProps = {
  id?: string;
  url: string;
  contentType: string;
  byteSize: number;
  kind: PostAttachmentKind;
  position: number;
};

export class PostAttachmentEntity {
  constructor(
    public readonly id: string | undefined,
    public readonly url: string,
    public readonly contentType: string,
    public readonly byteSize: number,
    public readonly kind: PostAttachmentKind,
    public readonly position: number,
  ) {}

  static createNew(params: Omit<PostAttachmentProps, 'id' | 'position'> & { position: number }) {
    return new PostAttachmentEntity(
      undefined,
      params.url,
      params.contentType,
      params.byteSize,
      params.kind,
      params.position,
    );
  }

  static rehydrate(props: Required<Pick<PostAttachmentProps, 'id'>> & PostAttachmentProps) {
    return new PostAttachmentEntity(
      props.id,
      props.url,
      props.contentType,
      props.byteSize,
      props.kind,
      props.position,
    );
  }
}
