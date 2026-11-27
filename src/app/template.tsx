import { PageTransition } from "@/components/layout/PageTransition";

// O template remonta a cada navegação (o layout não), e isso dispara a transição.
export default function Template({ children }: LayoutProps<"/">) {
  return <PageTransition>{children}</PageTransition>;
}
