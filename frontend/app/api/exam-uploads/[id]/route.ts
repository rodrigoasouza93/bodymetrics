import { getCurrentSession } from "@/src/lib/supabase/server-client";
import { handleGetExamUpload } from "@/src/features/exams/services/exam-upload-service";

export const GET = async (
  request: Request,
  { params }: { readonly params: Promise<{ readonly id: string }> },
) => {
  const { id } = await params;

  return handleGetExamUpload({
    session: await getCurrentSession(),
    uploadId: id,
  });
};
