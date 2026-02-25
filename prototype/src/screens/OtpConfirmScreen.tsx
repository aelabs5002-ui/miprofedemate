import React, { useState, useEffect } from 'react';

interface OtpConfirmScreenProps {
    email: string;
    alVolverALogin: () => void;
}

const OtpConfirmScreen: React.FC<OtpConfirmScreenProps> = ({ email, alVolverALogin }) => {
    // Si no llega email por props (raro con la lógica actual pero posible), intentar leer de storage
    const targetEmail = email || localStorage.getItem('pending_signup_email') || '';

    const [otpCode, setOtpCode] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const verificarOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        setLoading(true);

        if (!otpCode || otpCode.length !== 6) {
            setErrorMsg('El código debe tener 6 dígitos.');
            setLoading(false);
            return;
        }

        try {
            const { supabase } = await import('../lib/supabaseClient');
            const { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } = await import('../config/legalVersions');

            // 1. Verificar OTP
            const { data, error } = await supabase.auth.verifyOtp({
                email: targetEmail,
                token: otpCode,
                type: 'signup'
            });

            if (error || !data?.user) {
                console.error("OTP_VERIFY_FAIL", error);
                throw new Error("OTP verification failed");
            }

            console.log("LEGAL_STEP_1_VERIFY_OK");

            // 2. Obtener usuario directamente de la respuesta
            const parentId = data.user.id;
            const parentEmail = data.user.email;
            console.log("LEGAL_STEP_2_USER_ID", parentId);

            // 2.1 Asegurar existencia de registro en tabla 'parents' (Fail-Fast)
            console.log("PARENT_STEP_1_UPSERT_START", parentId);

            const { data: parentRow, error: parentErr } = await supabase
                .from("parents")
                .upsert(
                    {
                        id: parentId,
                        email: parentEmail // Se agrega email si column existe, sino supabase lo ignora si no está en schema o lanza error si es strict
                    },
                    { onConflict: "id" }
                )
                .select("id")
                .single();

            if (parentErr || !parentRow?.id) {
                console.error("PARENT_STEP_FAIL", parentErr);
                await supabase.auth.signOut(); // Bloquear
                throw new Error("Parent profile upsert failed");
            }

            console.log("PARENT_STEP_2_UPSERT_OK", parentRow.id);

            // 3. Verificar si ya existe aceptación legal (Idempotencia)
            const { data: existing } = await supabase
                .from("legal_acceptances")
                .select("id")
                .eq("parent_id", parentId)
                .maybeSingle();

            if (existing?.id) {
                console.log("[LEGAL] already exists", existing.id);
                // Si ya existe, NO intentamos insertar de nuevo.
                // Continuamos al Auth Flow normal.
            } else {
                // 4. Insertar Legal Acceptance (FAIL FAST)
                console.log("LEGAL_STEP_3_INSERT_START");

                const payload = {
                    parent_id: parentId,
                    accepted_terms: true,
                    accepted_privacy: true,
                    terms_version: CURRENT_TERMS_VERSION,
                    privacy_version: CURRENT_PRIVACY_VERSION,
                    accepted_at: new Date().toISOString(),
                    source: "otp_confirm",
                };

                const { data: inserted, error: insErr } = await supabase
                    .from("legal_acceptances")
                    .insert(payload)
                    .select("id")
                    .single();

                if (insErr || !inserted?.id) {
                    console.error("LEGAL_INSERT_FAIL", insErr);
                    // CRITICAL: Sign out to prevent navigation
                    await supabase.auth.signOut();
                    throw new Error("Legal acceptance insert failed");
                }

                console.log("[LEGAL] inserted id", inserted.id);
            }

            // Éxito Total
            setSuccessMsg('¡Cuenta confirmada y términos aceptados! Iniciando sesión...');
            // AppNavigator detectará la sesión y navegará.

        } catch (err: any) {
            console.error("LEGAL_FLOW_ERROR", err);
            setErrorMsg(err.message || 'Error en validación.');
            setLoading(false);
            // El usuario permanece en la pantalla de OTP para reintentar
        }
    };

    const reenviarOtp = async () => {
        setErrorMsg(null);
        setSuccessMsg(null);
        setLoading(true);
        try {
            const { supabase } = await import('../lib/supabaseClient');
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: targetEmail
            });
            if (error) throw error;
            setSuccessMsg('Código reenviado. Revisa tu correo.');
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Error al reenviar código.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            {/* Fondo Ambiental */}
            <div style={styles.ambientBackground}>
                <div style={styles.gridPattern} />
                <div style={styles.glowTopRight} />
            </div>

            <div style={styles.scrollContainer}>
                {/* Header */}
                <div style={styles.heroSection}>
                    <div style={styles.mentorImageWrapper}>
                        <img
                            src="/images/mentor_login.png"
                            alt="Mentor"
                            style={styles.mentorImage}
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>
                </div>

                <form onSubmit={verificarOtp} style={styles.formContainer}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <p style={{ color: '#34D399', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                            CÓDIGO DE VERIFICACIÓN
                        </p>
                        <p style={{ color: '#9CA3AF', fontSize: 13, lineHeight: '1.5' }}>
                            Ingresa el código de 6 dígitos enviado a<br />
                            <span style={{ color: 'white', fontWeight: '600' }}>{targetEmail}</span>
                        </p>
                    </div>

                    <div style={styles.inputGroup}>
                        <div style={styles.inputWrapper}>
                            <input
                                type="text"
                                placeholder="000000"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                style={{
                                    ...styles.input,
                                    textAlign: 'center',
                                    letterSpacing: 8,
                                    fontSize: 24,
                                    fontWeight: 'bold',
                                    color: '#34D399'
                                }}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Mensajes de Estado */}
                    {errorMsg && (
                        <div style={styles.errorMsg}>
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div style={styles.successMsg}>
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <button type="submit" style={styles.primaryButton} disabled={loading}>
                        {loading ? 'VERIFICANDO...' : 'CONFIRMAR CÓDIGO'}
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                        <button
                            type="button"
                            onClick={reenviarOtp}
                            disabled={loading}
                            style={{ ...styles.footerText, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            ¿No llegó? Reenviar código
                        </button>

                        <button
                            type="button"
                            onClick={alVolverALogin}
                            disabled={loading}
                            style={{ ...styles.footerText, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                        >
                            Volver al Login
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

// Estilos (Reutilizados de RegisterScreen para consistencia)
const styles = {
    pageContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: '#0A0E29',
        fontFamily: "'Inter', sans-serif",
        color: '#ffffff',
        position: 'relative' as const,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    ambientBackground: {
        position: 'fixed' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
        pointerEvents: 'none' as const,
    },
    gridPattern: {
        position: 'absolute' as const,
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
    },
    glowTopRight: {
        position: 'absolute' as const,
        top: '-10%', right: '-20%',
        width: '600px', height: '600px',
        backgroundColor: 'rgba(52, 211, 153, 0.08)',
        filter: 'blur(80px)',
        borderRadius: '50%',
    },
    scrollContainer: {
        position: 'relative' as const,
        zIndex: 10,
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        padding: '20px',
        maxWidth: '400px',
        margin: '0 auto',
        width: '100%',
        justifyContent: 'center',
    },
    heroSection: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
    },
    mentorImageWrapper: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid #34D399',
        boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)',
        backgroundColor: '#131b3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mentorImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    },
    formContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
        backgroundColor: 'rgba(19, 27, 58, 0.6)',
        padding: '24px',
        borderRadius: '20px',
        border: '1px solid rgba(52, 211, 153, 0.1)',
        backdropFilter: 'blur(10px)',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
    },
    inputWrapper: {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0f152e',
        border: '1px solid #2a3b68',
        borderRadius: '12px',
    },
    input: {
        width: '100%',
        backgroundColor: 'transparent',
        border: 'none',
        padding: '16px',
        color: '#ffffff',
        outline: 'none',
    },
    errorMsg: {
        fontSize: '13px',
        color: '#FF4C4C',
        backgroundColor: 'rgba(255, 76, 76, 0.1)',
        padding: '10px',
        borderRadius: '8px',
        textAlign: 'center' as const,
    },
    successMsg: {
        fontSize: '13px',
        color: '#34D399',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        padding: '10px',
        borderRadius: '8px',
        textAlign: 'center' as const,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: '#34D399',
        color: '#064E3B',
        border: 'none',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '15px',
        fontWeight: '800',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        cursor: 'pointer',
        marginTop: '8px',
        boxShadow: '0 0 20px rgba(52, 211, 153, 0.3)',
    },
    footerText: {
        fontSize: '14px',
        color: '#9CA3AF',
    },
};

export default OtpConfirmScreen;
