import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  const email = "43982810@admin.local"
  const password = "43982810"

  console.log("Creating admin user...")

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const userExists = existingUsers?.users?.some((u) => u.email === email)

  if (userExists) {
    console.log("Admin user already exists!")
    return
  }

  // Create the admin user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "admin",
      name: "Administrador",
    },
  })

  if (error) {
    console.error("Error creating admin user:", error.message)
    return
  }

  console.log("Admin user created successfully!")
  console.log("Email:", email)
  console.log("Password:", password)
  console.log("User ID:", data.user?.id)
}

createAdminUser()
