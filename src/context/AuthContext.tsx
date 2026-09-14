import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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
  signIn: (email: string, password: string) => Promise<ResultadoAuth>;
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

function papelValido(papel: unknown): papel is PapelUsuario {
  return papel === "cidadao" || papel === "moderador" || papel === "administrador";
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileState, setProfileState] = useState<ProfileState>(perfilInicial);
  const user = session?.user ?? null;

  useEffect(() => {
    let ativo = true;

    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!ativo) return;

        if (error) {
          console.error("Não foi possível restaurar a sessão do Supabase.", error);
          setSession(null);
        } else {
          setSession(data.session);
        }

        setSessionLoading(false);
      })
      .catch(error => {
        if (!ativo) return;

        console.error("Não foi possível restaurar a sessão do Supabase.", error);
        setSession(null);
        setSessionLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!ativo) return;

      setSession(nextSession);
      setSessionLoading(false);

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(nome: string, email: string, password: string): Promise<ResultadoCadastro> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
        },
      },
    });

    return { error, session: data.session };
  }

  async function signOut(): Promise<ResultadoAuth> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  const loading = sessionLoading
    || Boolean(user && (profileState.userId !== user.id || profileState.loading));

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile: profileState.profile,
    profileError: profileState.error,
    loading,
    signIn,
    signUp,
    signOut,
  }), [loading, profileState.error, profileState.profile, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
