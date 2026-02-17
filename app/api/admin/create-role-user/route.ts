import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { ADMIN_EMAIL } from "@/lib/auth/roles"

function getSupabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const resend = getResend()

    // Verify admin is making the request
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""))

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, role } = body

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!"

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: role,
      },
    })

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Insert into users table
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id: newUser.user.id,
      email: email.toLowerCase(),
      full_name: name,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error inserting user:", insertError)
      // Continue anyway, the auth user was created
    }

    // Send email with credentials
    try {
      await resend.emails.send({
        from: "WEEK-CHAIN <no-reply@week-chain.com>",
        to: email,
        subject: "Bienvenido a WEEK-CHAIN - Tu cuenta ha sido creada",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">WEEK-CHAIN</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Smart Vacational Certificate</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">¡Bienvenido, ${name}!</h2>
              
              <p>Tu cuenta ha sido creada en la plataforma WEEK-CHAIN con el rol de <strong>${role}</strong>.</p>
              
              <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #667eea;">Tus credenciales de acceso:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Contraseña temporal:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.week-chain.com/auth" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Iniciar Sesión</a>
              </div>
              
              <p style="color: #666; font-size: 14px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                Este correo fue enviado automáticamente por WEEK-CHAIN.<br>
                © 2025 WEEK-CHAIN. Todos los derechos reservados.
              </p>
            </div>
          </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      // Return success but note email failed
      return NextResponse.json({
        success: true,
        user: { id: newUser.user.id, email, name, role },
        emailSent: false,
        tempPassword: tempPassword, // Return password if email fails
        message: "Usuario creado pero el email no pudo ser enviado. Contraseña temporal incluida.",
      })
    }

    return NextResponse.json({
      success: true,
      user: { id: newUser.user.id, email, name, role },
      emailSent: true,
      message: "Usuario creado exitosamente. Se ha enviado un email con las credenciales.",
    })
  } catch (error) {
    console.error("Error in create-role-user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
