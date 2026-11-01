import { vi } from "vitest";

// Our routes only use NextResponse.json(...) and new NextResponse(null, { status }),
// which the standard Response class already provides. This keeps tests fast and simple.
vi.mock("next/server", () => ({ NextResponse: Response }));