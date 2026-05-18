import { useAdmin } from "@/context/AdminContext";

export const WhatsAppButton = () => {
  const { contact } = useAdmin();
  const phone = contact.whatsapp || "8801337744727";
  const text = encodeURIComponent("Hi AniRise! I'd like to discuss a project.");
  return (
    <a
      href={`https://wa.me/${phone}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with AniRise on WhatsApp"
      className="fixed bottom-24 right-5 z-50 group flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-elegant transition-smooth hover:scale-105 sm:h-auto sm:w-auto sm:gap-2 sm:pl-3 sm:pr-4 sm:py-3"
    >
      <svg className="h-8 w-8 sm:h-7 sm:w-7" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">
        <path d="M16.04 3.2c-7.04 0-12.76 5.72-12.76 12.76 0 2.25.59 4.45 1.72 6.38L3.18 28.8l6.62-1.74a12.7 12.7 0 0 0 6.24 1.59h.01c7.03 0 12.75-5.72 12.75-12.76 0-3.41-1.33-6.61-3.74-9.02a12.66 12.66 0 0 0-9.02-3.67Zm.01 23.3h-.01a10.58 10.58 0 0 1-5.38-1.47l-.39-.23-3.93 1.03 1.05-3.83-.25-.4a10.55 10.55 0 0 1-1.61-5.64c0-5.8 4.72-10.52 10.53-10.52 2.81 0 5.45 1.1 7.43 3.08a10.45 10.45 0 0 1 3.08 7.44c0 5.82-4.72 10.54-10.52 10.54Zm5.77-7.89c-.32-.16-1.87-.92-2.16-1.03-.29-.1-.5-.16-.71.16-.21.31-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.19-.18-.32-.02-.49.14-.65.14-.14.32-.37.47-.55.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.23 3.4 5.4 4.76.75.32 1.34.52 1.8.67.76.24 1.45.21 2 .13.61-.09 1.87-.76 2.13-1.5.26-.74.26-1.37.18-1.5-.08-.13-.29-.21-.61-.37Z" />
      </svg>
      <span className="hidden sm:inline text-sm font-semibold">Chat on WhatsApp</span>
    </a>
  );
};
