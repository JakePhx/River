import type { Comment } from "./post.types";

export type CommentNode = Comment & { children: CommentNode[] };

export function buildCommentTree(flat: Comment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  for (const c of flat) {
    map.set(c.id, { ...c, children: [] });
  }
  const roots: CommentNode[] = [];
  for (const c of flat) {
    const node = map.get(c.id)!;
    const pid = c.parentCommentId;
    if (!pid) {
      roots.push(node);
      continue;
    }
    const parent = map.get(pid);
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
