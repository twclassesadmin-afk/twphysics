import { MessageCircle } from "lucide-react";

export function WhatsappButton() {
  return (
    <a
      href="https://wa.me/919000000000"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
