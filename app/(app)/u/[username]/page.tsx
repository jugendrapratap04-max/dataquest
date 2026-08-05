import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProgress, getStreak } from "@/lib/progress";
import { levelFor, getAchievements, focusOf, checkUsername } from "@/lib/profile";
import { getSolvedStats, getYearActivity } from "@/lib/profile-stats";
import { getRank, getTimeline, earnedCertificates } from "@/lib/profile-server";
import {
  ProfileHeader, LevelPanel, SolvedPanel, TopicPanel,
  YearHeatmap, BadgeWall, CoursePanel, TimelinePanel,
} from "@/components/ProfileParts";

/* A student's profile as everyone else sees it.
 *
 * The whole point of a profile page is that you can send someone the link —
 * that is the difference between a profile and a dashboard, and until this route
 * existed Etudo only had the second one.
 *
 * NOTHING here is opt-out. A row is invisible until its owner sets
 * publicProfile, which defaults to false and can only be set by the student
 * themselves. A page that does not exist and a page that is switched off return
 * the same 404 on purpose: distinguishing them would turn this route into a way
 * to test whether a username belongs to somebody.
 *
 * What is shown is what the switch in the editor lists: name, title, bio, goal,
 * badges, counts and activity. Email, notes, drafts, submitted code and anything
 * else private is not read by this file at all.
 */

async function load(usernameParam: string) {
  // Run the same validation the API does before touching the database. A URL is
  // reachable by anyone, and this keeps junk out of a query on an indexed column.
  const check = checkUsername(decodeURIComponent(usernameParam));
  if (!check.ok) return null;

  return prisma.user.findFirst({
    where: { username: check.value, publicProfile: true },
    select: {
      id: true, name: true, role: true, avatarEmoji: true, bio: true, goal: true,
      xp: true, createdAt: true, username: true,
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await load(username);
  if (!user) return { title: "Profile not found" };
  return {
    title: `${user.name} — Etudo`,
    description: `${user.name} on Etudo: ${user.role}.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // One profile, one address. `checkUsername` lowercases before it matches, so
  // /u/Jugendra and /u/JUGENDRA would both render the same page under different
  // URLs — three addresses for one profile, which is a link that looks wrong
  // when someone pastes it back and a page search engines see three times.
  const canonical = decodeURIComponent(username).trim().toLowerCase();
  if (canonical && canonical !== username) redirect(`/u/${canonical}`);

  const user = await load(username);
  if (!user) notFound();

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
        level={lvl} username={user.username} isPublic own={false}
      />

      <LevelPanel
        level={lvl} xp={user.xp} streak={streak.streak} bestStreak={streak.bestStreak}
        solved={stats.totalSolved} lessonsDone={p.lessonsDone} rank={rank}
      />

      <SolvedPanel stats={stats} />
      <YearHeatmap year={year} own={false} />

      <div className="prof-cols">
        <div className="col">
          <BadgeWall achievements={achievements} own={false} />
          <CoursePanel tracks={started} certificates={certificates} own={false} />
        </div>
        <div className="col">
          <TopicPanel stats={stats} />
          <TimelinePanel timeline={timeline} own={false} />
        </div>
      </div>
    </>
  );
}
