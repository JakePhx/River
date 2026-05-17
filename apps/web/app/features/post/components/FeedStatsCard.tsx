import { useEffect, type ComponentType } from "react";
import { Link } from "react-router";
import { FileText, Inbox, MessageSquare, UserPlus, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchChatThreads } from "../../chat/chat.slice";

function StatRow({
  label,
  hint,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  hint?: string;
  value: number | string;
  href?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  const inner = (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50">
      <span className="min-w-0 flex flex-col gap-0.5 text-muted-foreground">
        <span className="flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" /> : null}
          <span className="text-foreground">{label}</span>
        </span>
        {hint ? (
          <span className="pl-6 text-[11px] leading-tight text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
  if (href) {
    return (
      <Link to={href} className="block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function FeedStatsCard() {
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.me.me);
  const threads = useAppSelector((s) => s.chat.threads);
  const threadsStatus = useAppSelector((s) => s.chat.threadsStatus);

  useEffect(() => {
    if (me) void dispatch(fetchChatThreads());
  }, [dispatch, me]);

  if (!me) return null;

  const profileBase = `/u/${me.username}`;
  const loading =
    threadsStatus === "loading" && threads.length === 0 ? ("…" as const) : null;
  const openedChatCount = loading
    ? loading
    : threads.filter((t) => t.status === "PENDING").length;
  const activeChatCount = loading
    ? loading
    : threads.filter((t) => t.status === "ACTIVE").length;

  return (
    <Card className="sticky top-20 border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Your stats</CardTitle>
        <p className="text-xs text-muted-foreground">
          <Link
            to={profileBase}
            className="font-medium text-foreground hover:underline"
          >
            @{me.username}
          </Link>
        </p>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <StatRow
          label="Posts"
          value={me.postCount}
          href={profileBase}
          icon={FileText}
        />
        <StatRow
          label="Followers"
          value={me.followersCount}
          href={profileBase}
          icon={Users}
        />
        <StatRow
          label="Following"
          value={me.followingCount}
          href={profileBase}
          icon={UserPlus}
        />
        <StatRow
          label="Opened chat"
          hint="Pending message requests"
          value={openedChatCount}
          href="/messages"
          icon={Inbox}
        />
        <StatRow
          label="Active chat"
          hint="Accepted chats"
          value={activeChatCount}
          href="/messages"
          icon={MessageSquare}
        />
      </CardContent>
    </Card>
  );
}
