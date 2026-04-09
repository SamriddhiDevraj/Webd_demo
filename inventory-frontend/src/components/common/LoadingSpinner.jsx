export default function LoadingSpinner({ fullScreen = false }) {
  const spinner = (
    <div className="w-10 h-10 rounded-full border-4 border-[#E2E8F0] border-t-[#0052FF] animate-spin" />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA]">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{spinner}</div>;
}
