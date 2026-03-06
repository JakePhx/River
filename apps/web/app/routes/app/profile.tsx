import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router";
import {
  Settings,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Mail,
  Phone,
  User as UserIcon,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchUserByUsername,
  fetchUserPosts,
  fetchFollowers,
  fetchFollowing,
  updateMyProfile,
} from "../../features/user/user.slice";
import {
  blockUser,
  cancelFollowRequest,
  followUser,
  unblockUser,
  unfollowUser,
  fetchRelation,
} from "../../features/relation/relation.slice";
import { PostCard } from "../../features/post/components/PostCard";
import { cn } from "~/lib/utils";

type Tab = "posts" | "followers" | "following";

function initials(name: string, username: string) {
  const display = name || username;
  return display
    .split(/[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function ProfileRoute() {
  const { username = "" } = useParams();
  const dispatch = useAppDispatch();

  const me = useAppSelector((s) => s.me.me);
  const usersByUsername = useAppSelector((s) => s.users.entitiesByUsername);
  const user = usersByUsername[username];
  const userStatus = useAppSelector((s) => s.users.status);
  const userError = useAppSelector((s) => s.users.error);

  const relationsByUserId = useAppSelector((s) => s.relations.byUserId);
  const rel = user ? relationsByUserId[user.id] : undefined;
  const relStatus = useAppSelector((s) => s.relations.status);
  const relError = useAppSelector((s) => s.relations.error);

  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Pagination states from Redux
  const userPosts = useAppSelector((s) =>
    user ? s.users.userPosts[user.id] : undefined,
  );
  const followers = useAppSelector((s) =>
    user ? s.users.followers[user.id] : undefined,
  );
  const following = useAppSelector((s) =>
    user ? s.users.following[user.id] : undefined,
  );

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!username) return;
    void dispatch(fetchUserByUsername({ username }));
  }, [username, dispatch]);

  useEffect(() => {
    if (user && me && user.id !== me.id) {
      void dispatch(fetchRelation({ targetUserId: user.id }));
    }
  }, [user?.id, me?.id, dispatch]);

  const loadTabData = useCallback(
    (reset = false) => {
      if (!user) return;
      const userId = user.id;
      if (activeTab === "posts") {
        void dispatch(
          fetchUserPosts({
            userId,
            reset,
            cursor: reset ? undefined : userPosts?.nextCursor,
          }),
        );
      } else if (activeTab === "followers") {
        void dispatch(
          fetchFollowers({
            userId,
            reset,
            cursor: reset ? undefined : followers?.nextCursor,
          }),
        );
      } else if (activeTab === "following") {
        void dispatch(
          fetchFollowing({
            userId,
            reset,
            cursor: reset ? undefined : following?.nextCursor,
          }),
        );
      }
    },
    [
      user,
      activeTab,
      dispatch,
      userPosts?.nextCursor,
      followers?.nextCursor,
      following?.nextCursor,
    ],
  );

  useEffect(() => {
    if (user && !userPosts && activeTab === "posts") loadTabData(true);
    if (user && !followers && activeTab === "followers") loadTabData(true);
    if (user && !following && activeTab === "following") loadTabData(true);
  }, [user, activeTab, userPosts, followers, following, loadTabData]);

  useEffect(() => {
    const currentTabState =
      activeTab === "posts"
        ? userPosts
        : activeTab === "followers"
          ? followers
          : following;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          currentTabState?.hasMore &&
          currentTabState.status === "idle"
        ) {
          loadTabData();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [activeTab, userPosts, followers, following, loadTabData]);

  if (!username) return <div className="p-4">Missing username.</div>;
  if (userStatus === "loading" && !user)
    return <div className="p-4">Loading profile…</div>;
  if (userStatus === "failed" && !user)
    return <div className="p-4 text-destructive">{userError?.message}</div>;
  if (!user) return <div className="p-4">User not found.</div>;

  const isMe = me?.id === user.id;
  const isBlocked = rel?.blocked ?? false;
  const followStatus = rel?.followStatus ?? "NONE";

  console.log(user.profile);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500">
          <img
            src={user.profile?.coverUrl ?? undefined}
            className="object-cover w-full h-full"
          />
        </div>
        <CardHeader className="relative pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-4">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900">
              <AvatarImage src={user.profile?.avatarUrl ?? undefined} />
              <AvatarFallback className="text-2xl font-bold">
                {initials(user.name, user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {user.name || user.username}
                  </CardTitle>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
                <div className="flex gap-2">
                  {isMe ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      {isBlocked ? (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            dispatch(unblockUser({ targetUserId: user.id }))
                          }
                        >
                          Unblock
                        </Button>
                      ) : (
                        <>
                          {followStatus === "FOLLOWING" ? (
                            <Button
                              variant="secondary"
                              onClick={() =>
                                dispatch(
                                  unfollowUser({ targetUserId: user.id }),
                                )
                              }
                            >
                              Unfollow
                            </Button>
                          ) : followStatus === "REQUESTED" ? (
                            <Button
                              variant="secondary"
                              onClick={() =>
                                dispatch(
                                  cancelFollowRequest({
                                    targetUserId: user.id,
                                  }),
                                )
                              }
                            >
                              Requested
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                dispatch(followUser({ targetUserId: user.id }))
                              }
                            >
                              Follow
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() =>
                              dispatch(blockUser({ targetUserId: user.id }))
                            }
                          >
                            Block
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {user.profile?.bio && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {user.profile.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {user.profile?.title && (
                <div className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4" />
                  <span>
                    {user.profile.title}
                    {user.profile.company ? ` at ${user.profile.company}` : ""}
                  </span>
                </div>
              )}
              {user.profile?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{user.profile.location}</span>
                </div>
              )}
              {user.profile?.website && (
                <div className="flex items-center gap-1.5">
                  <LinkIcon className="h-4 w-4" />
                  <a
                    href={user.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {user.profile.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <button
                onClick={() => setActiveTab("posts")}
                className="hover:underline text-left"
              >
                <span className="font-bold">{user.postCount}</span>{" "}
                <span className="text-muted-foreground">Posts</span>
              </button>
              <button
                onClick={() => setActiveTab("followers")}
                className="hover:underline text-left"
              >
                <span className="font-bold">{user.followersCount}</span>{" "}
                <span className="text-muted-foreground">Followers</span>
              </button>
              <button
                onClick={() => setActiveTab("following")}
                className="hover:underline text-left"
              >
                <span className="font-bold">{user.followingCount}</span>{" "}
                <span className="text-muted-foreground">Following</span>
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="border-b flex">
        {(["posts", "followers", "following"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "posts" && (
          <>
            {userPosts?.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {userPosts?.status === "loading" && (
              <div className="text-center py-4">Loading posts…</div>
            )}
            {userPosts?.items.length === 0 && userPosts.status === "idle" && (
              <div className="text-center py-12 text-muted-foreground">
                No posts yet.
              </div>
            )}
          </>
        )}

        {(activeTab === "followers" || activeTab === "following") && (
          <Card>
            <CardContent className="divide-y p-0">
              {(activeTab === "followers" ? followers : following)?.items.map(
                (u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Link to={`/u/${u.username}`}>
                        <Avatar>
                          <AvatarImage
                            src={u.profile?.avatarUrl ?? undefined}
                          />
                          <AvatarFallback>
                            {initials(u.name, u.username)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <Link
                          to={`/u/${u.username}`}
                          className="font-semibold hover:underline block leading-tight"
                        >
                          {u.name || u.username}
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          @{u.username}
                        </span>
                      </div>
                    </div>
                    <Link to={`/u/${u.username}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                ),
              )}
              {(activeTab === "followers" ? followers : following)?.status ===
                "loading" && <div className="p-4 text-center">Loading…</div>}
              {(activeTab === "followers" ? followers : following)?.items
                .length === 0 &&
                (activeTab === "followers" ? followers : following)?.status ===
                  "idle" && (
                  <div className="p-8 text-center text-muted-foreground">
                    No {activeTab} yet.
                  </div>
                )}
            </CardContent>
          </Card>
        )}
        <div ref={observerTarget} className="h-4" />
      </div>

      {/* Edit Profile Modal */}
      {isMe && (
        <EditProfileModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          user={user}
        />
      )}
    </div>
  );
}

function EditProfileModal({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.profile?.bio || "",
    title: user.profile?.title || "",
    company: user.profile?.company || "",
    location: user.profile?.location || "",
    website: user.profile?.website || "",
    contact: user.profile?.contact || "",
    avatarUrl: user.profile?.avatarUrl || "",
    gender: user.profile?.gender || "OTHER",
    isPrivate: user.isPrivate || false,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(updateMyProfile(formData));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. Software Engineer"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={formData.avatarUrl}
              onChange={(e) =>
                setFormData({ ...formData, avatarUrl: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value as any })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) =>
                setFormData({ ...formData, isPrivate: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isPrivate">Private Account</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
