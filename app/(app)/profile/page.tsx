import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getProgress, getStreak } from "@/lib/progress";
import { levelFor, getAchievements, focusOf } from "@/lib/profile";
import { getSolvedStats, getYearActivity } from "@/lib/profile-stats";
import { getRank, getTimeline, earnedCertificates } from "@/lib/profile-server";
import { ProfileEditor } from "@/components/ProfileEditor";
import {
  ProfileHeader, LevelPanel, SolvedPanel, TopicPanel,
  YearHeatmap, BadgeWall, CoursePanel, TimelinePanel,
} from "@/components/ProfileParts";

// Member-only, like /notes and /focus. Everything on this page is one person's
// own — their bio, their history, their badges — so there is genuinely nothing
// here to show a stranger who is not the owner. The version a stranger CAN see
// is /u/<username>, which the student switches on themselves.
export const metadata = { title: "Your Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [p, streak, stats, year, rank, timeline] = await Promise.all([
    getProgress(user.id),
    getStreak(user.id),
    getSolvedStats(user.id),
    getYearActivity(user.id),
    getRank(user.id),
    getTimeline(user.id, 12),
  ]);

  const lvl = levelFor(user.xp);
  const certificates = earnedCertificates(p.tracks);
  const achievements = getAchievements({ p, streak, certificates, solved: stats });
  const started = p.tracks.filter((t) => t.lessonsDone > 0 || t.problemsDone > 0);
  const joined = user.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <>
      <ProfileHeader
        name={user.name} role={user.role} avatarEmoji={user.avatarEmoji}
        bio={user.bio} goal={user.goal} joined={joined} focus={focusOf(p)}
        level={lvl} username={user.username} isPublic={user.publicProfile} own
      >
        <ProfileEditor
          name={user.name}
          initial={{
            role: user.role, goal: user.goal, bio: user.bio, avatarEmoji: user.avatarEmoji,
            username: user.username, publicProfile: user.publicProfile,
          }}
        />
      </ProfileHeader>

      {/* A username exists but the page is off — say so once, here, rather than
          leaving the student to wonder why the link is not on their header. */}
      {user.username && !user.publicProfile && (
        <p className="prof-hint">
          Your public page at <b>/u/{user.username}</b> is switched off. Turn it on under
          <b> Edit profile → Sharing</b> to share it.
        </p>
      )}

      <LevelPanel
        level={lvl} xp={user.xp} streak={streak.streak} bestStreak={streak.bestStreak}
        solved={stats.totalSolved} lessonsDone={p.lessonsDone} rank={rank}
      />

      <SolvedPanel stats={stats} />
      <YearHeatmap year={year} own />

      <div className="prof-cols">
        <div className="col">
          <BadgeWall achievements={achievements} own />
          <CoursePanel tracks={started} certificates={certificates} own />
          <section className="card pad">
            <div className="sec-head">
              <h2>Certificates{" "}<span className="sub">issued on a finished subject</span></h2>
              <Link className="link" href="/certificates">View all →</Link>
            </div>
            <p className="prof-empty" style={{ margin: 0 }}>
              {certificates > 0
                ? <><b>{certificates}</b> earned so far — collect them from the certificates page.</>
                : <>None yet. Finishing a subject issues one automatically, with your name on it.</>}
            </p>
          </section>
        </div>

        <div className="col">
          <TopicPanel stats={stats} />
          <TimelinePanel timeline={timeline} own />
        </div>
      </div>
    </>
  );
}
