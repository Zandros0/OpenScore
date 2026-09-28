import { NewGame } from "@/components/home/NewGame";

export default function HomeScreen() {
    // One game at a time: NewGame shows the "Nouvelle partie" form, or the active
    // game as a resumable card if there is one — it no longer force-redirects into
    // /game, so leaving the scoreboard for home doesn't just bounce back into it.
    return <NewGame />;
}
