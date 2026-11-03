import { Link } from "@tanstack/react-router";
import { BadgeCheck, Building2, Heart, MessageCircle, Send, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Account = {
  handle: string;
  name: string;
  kind: "Government" | "Institution" | "Creator" | "FPO" | "You";
  bio: string;
  verified?: boolean;
  platforms?: { label: string; url: string }[];
};

type Comment = { id: string; author: string; text: string };
type Post = {
  id: string;
  author: string;
  text: string;
  tag: string;
  time: string;
  likes: number;
  liked?: boolean;
  comments: Comment[];
};

const SEED_ACCOUNTS: Account[] = [
  {
    handle: "@raitamitra_ka",
    name: "Raitha Mitra · Dept. of Agriculture, Karnataka",
    kind: "Government",
    bio: "Official scheme announcements, subsidy windows and DBT updates for Karnataka farmers.",
    verified: true,
    platforms: [
      { label: "Instagram", url: "https://www.instagram.com/raitamitra_ka/" },
      { label: "Facebook", url: "https://www.facebook.com/raitamitrakarnataka/" },
    ],
  },
  {
    handle: "@agrigoi",
    name: "Ministry of Agriculture & Farmers Welfare",
    kind: "Government",
    bio: "Central schemes, MSP notifications and national advisories.",
    verified: true,
    platforms: [{ label: "Instagram", url: "https://www.instagram.com/agri_goi/" }],
  },
  {
    handle: "@uasbangalore",
    name: "UAS Bengaluru",
    kind: "Institution",
    bio: "Research bulletins, variety releases and Krishi Mela updates.",
    verified: true,
    platforms: [{ label: "Facebook", url: "https://www.facebook.com/UASBangalore/" }],
  },
  {
    handle: "@kvk_mangaluru",
    name: "KVK Dakshina Kannada",
    kind: "Institution",
    bio: "Field demonstrations for arecanut, coconut and paddy growers.",
    verified: true,
    platforms: [{ label: "Instagram", url: "https://www.instagram.com/kvk_mangaluru/" }],
  },
  {
    handle: "@savayava_krishi",
    name: "Savayava Krishi Kannada",
    kind: "Creator",
    bio: "ಸಾವಯವ ಕೃಷಿ tips in Kannada — jeevamrutha, mulching and seed saving.",
    platforms: [{ label: "Instagram", url: "https://www.instagram.com/savayava_krishi/" }],
  },
  {
    handle: "@malnad_fpo",
    name: "Malnad Growers FPO",
    kind: "FPO",
    bio: "Collective marketing of coffee, pepper and arecanut from Chikkamagaluru.",
    platforms: [{ label: "Facebook", url: "https://www.facebook.com/" }],
  },
];

const SEED_POSTS: Post[] = [
  {
    id: "p1",
    author: "@raitamitra_ka",
    text: "ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆಯಡಿ ಕೃಷಿ ಹೊಂಡ ನಿರ್ಮಾಣಕ್ಕೆ ಅರ್ಜಿ ಆಹ್ವಾನ. Applications for farm ponds under Krishi Bhagya are open at your Raitha Samparka Kendra until the end of this month.",
    tag: "Scheme",
    time: "2h",
    likes: 214,
    comments: [
      { id: "c1", author: "@savayava_krishi", text: "Please extend the date for Malnad taluks." },
    ],
  },
  {
    id: "p2",
    author: "@uasbangalore",
    text: "New short-duration ragi variety trials show 11% higher yield under delayed monsoon. Seed will be available at Krishi Mela counters.",
    tag: "Research",
    time: "6h",
    likes: 168,
    comments: [],
  },
  {
    id: "p3",
    author: "@savayava_krishi",
    text: "ಜೀವಾಮೃತ ತಯಾರಿಸುವ ವಿಧಾನ: 10 ಕೆಜಿ ಸಗಣಿ, 10 ಲೀ ಗೋಮೂತ್ರ, 2 ಕೆಜಿ ಬೆಲ್ಲ, 2 ಕೆಜಿ ಹಿಟ್ಟು, ಒಂದು ಹಿಡಿ ಮಣ್ಣು — 200 ಲೀ ನೀರಿನಲ್ಲಿ 48 ಗಂಟೆ ಹುದುಗಿಸಿ.",
    tag: "How-to",
    time: "1d",
    likes: 402,
    comments: [
      { id: "c2", author: "@malnad_fpo", text: "Works well on our pepper vines too." },
      { id: "c3", author: "@kvk_mangaluru", text: "Stir twice a day, clockwise." },
    ],
  },
];

const KEY = "agrova-social-v1";
const initials = (s: string) => s.replace("@", "").slice(0, 2).toUpperCase();

export function SocialFeed() {
  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS);
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [following, setFollowing] = useState<string[]>([]);
  const [me, setMe] = useState<Account | null>(null);
  const [signupName, setSignupName] = useState("");
  const [signupHandle, setSignupHandle] = useState("");
  const [draft, setDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"feed" | "discover" | "profile">("feed");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const s = JSON.parse(raw) as {
        accounts?: Account[];
        posts?: Post[];
        following?: string[];
        me?: Account | null;
      };
      if (s.accounts) setAccounts(s.accounts);
      if (s.posts) setPosts(s.posts);
      if (s.following) setFollowing(s.following);
      if (s.me) setMe(s.me);
    } catch {
      /* ignore corrupted local state */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ accounts, posts, following, me }));
    } catch {
      /* storage unavailable */
    }
  }, [accounts, posts, following, me]);

  const byHandle = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.handle, a])),
    [accounts],
  );

  const visible = useMemo(
    () =>
      tab === "feed" && following.length
        ? posts.filter((p) => following.includes(p.author) || p.author === me?.handle)
        : tab === "profile"
          ? []
          : posts,
    [posts, tab, following, me],
  );

  function createAccount() {
    const handle = `@${signupHandle.replace(/[^a-z0-9_]/gi, "").toLowerCase()}`;
    if (!signupName.trim() || handle.length < 4) {
      toast.error("Add a name and a handle of at least 3 characters.");
      return;
    }
    if (byHandle[handle]) {
      toast.error("That handle is already taken.");
      return;
    }
    const account: Account = {
      handle,
      name: signupName.trim(),
      kind: "You",
      bio: "Farmer on AGROVA AI",
    };
    setAccounts((a) => [account, ...a]);
    setMe(account);
    setFollowing((f) => [...new Set([...f, "@raitamitra_ka", "@uasbangalore"])]);
    toast.success(`Welcome, ${handle}`, { description: "You now follow two official accounts." });
  }

  function publish() {
    if (!me || !draft.trim()) return;
    setPosts((p) => [
      {
        id: crypto.randomUUID(),
        author: me.handle,
        text: draft.trim(),
        tag: "Field note",
        time: "now",
        likes: 0,
        comments: [],
      },
      ...p,
    ]);
    setDraft("");
    toast.success("Posted to the community feed.");
  }

  function comment(postId: string) {
    const text = (commentDraft[postId] ?? "").trim();
    if (!me || !text) return;
    setPosts((p) =>
      p.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, { id: crypto.randomUUID(), author: me.handle, text }],
            }
          : post,
      ),
    );
    setCommentDraft((c) => ({ ...c, [postId]: "" }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        {me ? (
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials(me.handle)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{me.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {me.handle} · following {following.length}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share a field update, a price, a question… (ಕನ್ನಡದಲ್ಲಿಯೂ ಬರೆಯಬಹುದು)"
                rows={3}
              />
              <div className="flex justify-end">
                <Button variant="hero" size="sm" onClick={publish} disabled={!draft.trim()}>
                  <Send /> Post
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Create your account</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="s-name">Display name</Label>
                <Input
                  id="s-name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Shivanna, Mandya"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="s-handle">Handle</Label>
                <Input
                  id="s-handle"
                  value={signupHandle}
                  onChange={(e) => setSignupHandle(e.target.value)}
                  placeholder="shivanna_mandya"
                />
              </div>
              <div className="sm:col-span-2">
                <Button variant="hero" onClick={createAccount}>
                  <UserPlus /> Create account
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Saved on this device for now. Connect Lovable Cloud to make accounts, posts and
                  follows shared and permanent.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          {(["feed", "discover", "profile"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tab === t ? "default" : "outline"}
              className="capitalize"
              onClick={() => setTab(t)}
            >
              {t === "feed" ? "Your feed" : t === "discover" ? "Discover all" : "My profile"}
            </Button>
          ))}
        </div>

        {tab === "profile" && me && (
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center gap-3">
              <Avatar className="size-14">
                <AvatarFallback>{initials(me.handle)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{me.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{me.handle}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{me.bio}</p>
              <div className="flex gap-5 text-muted-foreground">
                <span>
                  <strong className="text-foreground">
                    {posts.filter((p) => p.author === me.handle).length}
                  </strong>{" "}
                  posts
                </span>
                <span>
                  <strong className="text-foreground">{following.length}</strong> following
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {visible.map((p) => {
          const a = byHandle[p.author];
          return (
            <Card key={p.id} className="border-border/60">
              <CardHeader className="flex-row items-start gap-3">
                <Avatar>
                  <AvatarFallback>{initials(p.author)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                    {a?.name ?? p.author}
                    {a?.verified && <BadgeCheck className="size-4 text-primary" />}
                    <span className="font-normal text-muted-foreground">
                      {p.author} · {p.time}
                    </span>
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {p.tag}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{p.text}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button
                    className="flex items-center gap-1.5 transition-colors hover:text-primary"
                    onClick={() =>
                      setPosts((ps) =>
                        ps.map((x) =>
                          x.id === p.id
                            ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }
                            : x,
                        ),
                      )
                    }
                  >
                    <Heart className={`size-4 ${p.liked ? "fill-primary text-primary" : ""}`} />
                    {p.likes}
                  </button>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-4" /> {p.comments.length}
                  </span>
                </div>

                {p.comments.length > 0 && (
                  <ul className="space-y-2 border-l-2 border-border pl-4">
                    {p.comments.map((c) => (
                      <li key={c.id} className="text-sm">
                        <span className="font-medium">{c.author}</span>{" "}
                        <span className="text-muted-foreground">{c.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {me ? (
                  <div className="flex gap-2">
                    <Input
                      value={commentDraft[p.id] ?? ""}
                      onChange={(e) => setCommentDraft((c) => ({ ...c, [p.id]: e.target.value }))}
                      placeholder="Write a comment…"
                      onKeyDown={(e) => e.key === "Enter" && comment(p.id)}
                    />
                    <Button size="sm" variant="outline" onClick={() => comment(p.id)}>
                      Reply
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Create an account above to like, comment and follow.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" /> Accounts to follow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts
              .filter((a) => a.handle !== me?.handle)
              .map((a) => {
                const isFollowing = following.includes(a.handle);
                return (
                  <div key={a.handle} className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(a.handle)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        {a.name}
                        {a.verified && <BadgeCheck className="size-4 text-primary" />}
                      </p>
                      <p className="text-xs text-muted-foreground">{a.bio}</p>
                      <Badge variant="secondary" className="mt-1.5">
                        <Building2 className="size-3" /> {a.kind}
                      </Badge>
                      {a.platforms && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {a.platforms.map((platform) => (
                            <a
                              key={platform.label}
                              href={platform.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="text-xs text-primary underline underline-offset-2"
                            >
                              {platform.label} profile
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isFollowing ? "outline" : "default"}
                      onClick={() =>
                        setFollowing((f) =>
                          isFollowing ? f.filter((h) => h !== a.handle) : [...f, a.handle],
                        )
                      }
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Looking for scheme news or loan options instead?{" "}
            <Link to="/outreach" className="text-primary underline">
              Switch tabs above
            </Link>{" "}
            for News and Bank.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
