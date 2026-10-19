import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { limparRetornoGoogle } from "@/lib/retornoLogin";

export type PapelUsuario = "cidadao" | "moderador" | "administrador";

export type Profile = {
  id: string;
  nome: string;
  papel: PapelUsuario;
  created_at: string;
  updated_at: string;
};

type ResultadoAuth = {
  error: AuthError | null;
};

type ResultadoCadastro = ResultadoAuth & {
  session: Session | null;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  profileError: string | null;
  loading: boolean;
  passwordRecovery: boolean;
  concluirRecuperacaoSenha: () => void;
  signIn: (email: string, password: string) => Promise<ResultadoAuth>;
  entrarComGoogle: () => Promise<ResultadoAuth>;
  signUp: (nome: string, email: string, password: string) => Promise<ResultadoCadastro>;
  signOut: () => Promise<ResultadoAuth>;
};

type ProfileState = {
  userId: string | null;
  profile: Profile | null;
  error: string | null;
  loading: boolean;
};

const perfilInicial: ProfileState = {
  userId: null,
  profile: null,
  error: null,
  loading: false,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const RECOVERY_USER_KEY = "paracatu360:recovery-user";

function lerUsuarioRecuperacao(): string | null {
  try {
    return window.sessionStorage.getItem(RECOVERY_USER_KEY);
  } catch {
    return null;
  }
}

function guardarUsuarioRecuperacao(userId: string | null): void {
  try {
    if (userId) window.sessionStorage.setItem(RECOVERY_USER_KEY, userId);
    else window.sessionStorage.removeItem(RECOVERY_USER_KEY);
  } catch {
    // O formulário ainda funciona na aba atual se o armazenamento estiver indisponível.
  }
}

function papelValido(papel: unknown): papel is PapelUsuario {
  return papel === "cidadao" || papel === "moderador" || papel === "administrador";
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileState, setProfileState] = useState<ProfileState>(perfilInicial);
  const [recoveryUserId, setRecoveryUserId] = useState<string | null>(lerUsuarioRecuperacao);
  const recoveryUserIdRef = useRef(recoveryUserId);
  const user = session?.user ?? null;

  function definirUsuarioRecuperacao(userId: string | null) {
    recoveryUserIdRef.current = userId;
    setRecoveryUserId(userId);
    guardarUsuarioRecuperacao(userId);
  }

  useEffect(() => {
    let ativo = true;

    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!ativo) return;

        if (error) {
          console.error("Não foi possível restaurar a sessão do Supabase.", error);
          setSession(null);
          definirUsuarioRecuperacao(null);
        } else {
          setSession(data.session);
          if (!data.session) definirUsuarioRecuperacao(null);
        }

        setSessionLoading(false);
      })
      .catch(error => {
        if (!ativo) return;

        console.error("Não foi possível restaurar a sessão do Supabase.", error);
        setSession(null);
        definirUsuarioRecuperacao(null);
        setSessionLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!ativo) return;

      setSession(nextSession);
      setSessionLoading(false);

      if (event === "PASSWORD_RECOVERY" && nextSession?.user) {
        definirUsuarioRecuperacao(nextSession.user.id);
      } else if (!nextSession ||
        (recoveryUserIdRef.current && nextSession.user.id !== recoveryUserIdRef.current)) {
        definirUsuarioRecuperacao(null);
      }

      if (!nextSession?.user) {
        setProfileState(perfilInicial);
      }
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfileState(perfilInicial);
      return;
    }

    let ativo = true;

    setProfileState({
      userId: user.id,
      profile: null,
      error: null,
      loading: true,
    });

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, nome, papel, created_at, updated_at")
          .eq("id", user.id)
          .maybeSingle();

        if (!ativo) return;

        if (error || !data || !papelValido(data.papel)) {
          if (error) {
            console.error("Não foi possível carregar o profile do usuário.", error);
          }

          setProfileState({
            userId: user.id,
            profile: null,
            error: "Não foi possível carregar os dados do perfil.",
            loading: false,
          });
          return;
        }

        setProfileState({
          userId: user.id,
          profile: {
            id: data.id,
            nome: data.nome,
            papel: data.papel,
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
          error: null,
          loading: false,
        });
      } catch (error) {
        if (!ativo) return;

        console.error("Não foi possível carregar o profile do usuário.", error);
        setProfileState({
          userId: user.id,
          profile: null,
          error: "Não foi possível carregar os dados do perfil.",
          loading: false,
        });
      }
    })();

    return () => {
      ativo = false;
    };
  }, [user]);

  async function signIn(email: string, password: string): Promise<ResultadoAuth> {
    limparRetornoGoogle();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) definirUsuarioRecuperacao(null);
    return { error };
  }

  async function entrarComGoogle(): Promise<ResultadoAuth> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/entrar` },
    });
    if (!error) definirUsuarioRecuperacao(null);
    return { error };
  }

  async function signUp(nome: string, email: string, password: string): Promise<ResultadoCadastro> {
    limparRetornoGoogle();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
        },
      },
    });

    if (!error) definirUsuarioRecuperacao(null);
    return { error, session: data.session };
  }

  async function signOut(): Promise<ResultadoAuth> {
    const { error } = await supabase.auth.signOut();
    if (!error) definirUsuarioRecuperacao(null);
    return { error };
  }

  function concluirRecuperacaoSenha(): void {
    definirUsuarioRecuperacao(null);
  }

  const loading = sessionLoading
    || Boolean(user && (profileState.userId !== user.id || profileState.loading));

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile: profileState.profile,
    profileError: profileState.error,
    loading,
    passwordRecovery: Boolean(session && recoveryUserId === session.user.id),
    concluirRecuperacaoSenha,
    signIn,
    entrarComGoogle,
    signUp,
    signOut,
  }), [loading, profileState.error, profileState.profile, recoveryUserId, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
