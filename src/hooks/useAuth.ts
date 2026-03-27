import { useShallow } from 'zustand/react/shallow'

import { useNuzlockeStore } from './useNuzlockeStore'

export const useAuth = () => {
  return useNuzlockeStore(
    useShallow((state) => ({
      authStatus: state.authStatus,
      isBootstrapped: state.isBootstrapped,
      session: state.session,
      signIn: state.signIn,
      signUp: state.signUp,
      signOut: state.signOut,
      bootstrap: state.bootstrap,
    })),
  )
}
