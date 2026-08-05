import { avatarHue, initialsOf } from "@/lib/profile";

/** The one avatar in the app: a colour derived from the name, with either the
 *  student's chosen emoji or their initials on top.
 *
 *  No image, no upload, no URL. A photo would mean blob storage (a bill) and a
 *  moderation problem, and this gives every account something recognisably its
 *  own from the moment it is created — including the ones that will never open
 *  the profile page.
 *
 *  Plain and presentational so it works in the server-rendered profile page and
 *  in the client-rendered sidebar without two versions of it existing. */
export function Avatar({
  name,
  emoji,
  size = 40,
  ring = false,
}: {
  name: string;
  emoji?: string | null;
  size?: number;
  /** A soft outline, for the one big avatar at the top of a profile. */
  ring?: boolean;
}) {
  const hue = avatarHue(name || "?");
  return (
    <span
      className={`avatar${ring ? " ringed" : ""}`}
      style={{
        width: size,
        height: size,
        // Emoji need more of the circle than two letters do, or they read as
        // a speck in the middle of a large disc.
        fontSize: emoji ? Math.round(size * 0.52) : Math.round(size * 0.38),
        background: `linear-gradient(150deg, hsl(${hue} 58% 46%), hsl(${(hue + 42) % 360} 54% 32%))`,
      }}
      aria-hidden="true"
    >
      {emoji || initialsOf(name || "?")}
    </span>
  );
}
