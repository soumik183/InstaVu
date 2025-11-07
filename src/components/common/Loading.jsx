import { InstaVuLogo } from '../../assets/icons';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8 animate-bounce">
          <InstaVuLogo className="w-24 h-24 mx-auto text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">InstaVu</h2>
        <div className="flex gap-2 justify-center">
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}