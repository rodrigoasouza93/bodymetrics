import { getCurrentSession } from "@/src/lib/supabase/server-client";
import { handlePostExamUpload } from "@/src/features/exams/services/exam-upload-service";

export const POST = async (request: Request) =>
  handlePostExamUpload({
    request,
    session: await getCurrentSession(),
  });
