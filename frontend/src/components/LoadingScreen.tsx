export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="rounded-3xl shadow-2xl overflow-hidden">
        <img src="/loading.gif" alt="Cargando..." className="w-72 h-72" />
      </div>
    </div>
  );
}