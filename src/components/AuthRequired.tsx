import React from 'react';
import { Lock } from 'lucide-react';

interface AuthRequiredProps {
  feature: string;
  onSignIn: () => void;
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ feature, onSignIn }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-white rounded-sm shadow-lg border-2 border-lorcana-gold p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-lorcana-gold/10 rounded-full">
            <Lock size={48} className="text-lorcana-gold" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-lorcana-ink mb-3">
          Sign In Required
        </h2>
        
        <p className="text-lorcana-navy mb-6">
          You need to sign in to access your {feature}. Sign in to sync your collection across all your devices!
        </p>
        
        <button
          onClick={onSignIn}
          className="w-full px-6 py-3 bg-lorcana-navy text-lorcana-gold rounded-sm hover:bg-opacity-90 transition-colors font-medium"
        >
          Sign In to Continue
        </button>
      </div>
    </div>
  );
};

export default AuthRequired;