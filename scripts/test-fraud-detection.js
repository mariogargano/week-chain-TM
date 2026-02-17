// Script de Node.js para probar la detección de fraude

const testCases = [
  {
    name: "Usuario legítimo",
    data: {
      userId: "user-001",
      ip: "192.168.1.100",
      fingerprint: "fp-unique-001",
      email: "broker@weekchain.com",
    },
    expectedFraud: false,
  },
  {
    name: "IP duplicada",
    data: {
      userId: "user-002",
      ip: "192.168.1.100", // Misma IP
      fingerprint: "fp-unique-002",
      email: "broker2@weekchain.com",
    },
    expectedFraud: true,
  },
  {
    name: "Device fingerprint duplicado",
    data: {
      userId: "user-003",
      ip: "192.168.1.101",
      fingerprint: "fp-unique-001", // Mismo fingerprint
      email: "broker3@weekchain.com",
    },
    expectedFraud: true,
  },
  {
    name: "Email personal (no corporativo)",
    data: {
      userId: "user-004",
      ip: "192.168.1.102",
      fingerprint: "fp-unique-004",
      email: "test@gmail.com",
    },
    expectedFraud: true,
  },
  {
    name: "Demasiados referidos (abuse)",
    data: {
      userId: "user-005",
      ip: "192.168.1.103",
      fingerprint: "fp-unique-005",
      email: "broker5@weekchain.com",
      referralsThisMonth: 51, // Más del límite de México (50)
      country: "MX",
    },
    expectedFraud: true,
  },
]

async function runTests() {
  console.log("🔍 Ejecutando tests de detección de fraude\n")
  console.log("=".repeat(50))

  let passed = 0
  let failed = 0

  for (const test of testCases) {
    console.log(`\n📝 Test: ${test.name}`)
    console.log(`   Datos:`, JSON.stringify(test.data, null, 2))

    try {
      const response = await fetch("http://localhost:3000/api/compliance/check-fraud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(test.data),
      })

      const result = await response.json()
      const fraudDetected = result.alerts && result.alerts.length > 0

      if (fraudDetected === test.expectedFraud) {
        console.log(`   ✅ PASÓ - Fraude detectado: ${fraudDetected}`)
        passed++
      } else {
        console.log(`   ❌ FALLÓ - Esperado: ${test.expectedFraud}, Obtenido: ${fraudDetected}`)
        failed++
      }

      if (result.alerts && result.alerts.length > 0) {
        console.log(`   🚨 Alertas:`, result.alerts.map((a) => a.type).join(", "))
      }
    } catch (error) {
      console.log(`   ❌ ERROR:`, error.message)
      failed++
    }
  }

  console.log("\n" + "=".repeat(50))
  console.log(`\n📊 Resultados: ${passed} pasados, ${failed} fallados`)
  console.log(`   Éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`)
}

runTests()
