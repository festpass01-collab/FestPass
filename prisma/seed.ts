import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding FestPass database...");

  const tenant = await prisma.tenant.upsert({
    where: { cnpj: "12345678000195" },
    update: {},
    create: {
      nomeFantasia: "Parque Alegria Kids",
      razaoSocial: "Alegria Kids Entretenimento LTDA",
      cnpj: "12345678000195",
      email: "contato@alegriaKids.com.br",
      telefone: "(11) 99999-1234",
      endereco: "Rua das Festas, 100",
      cidade: "São Paulo",
      uf: "SP",
      cep: "01310-100",
      instagram: "@alegriaKids",
      corPrimaria: "#7c3aed",
      corSecundaria: "#ede9fe",
      subdominio: "alegria",
      lgpdTexto:
        "Ao se cadastrar, você concorda com nossa Política de Privacidade e autoriza o uso dos seus dados para envio do QR Code de acesso e comunicações relacionadas ao evento.",
    },
  });

  console.log(`✅ Tenant criado: ${tenant.nomeFantasia}`);

  const senhaHash = await bcrypt.hash("festpass123", 12);

  await prisma.user.upsert({
    where: { email_tenantId: { email: "adm@alegriaKids.com.br", tenantId: tenant.id } },
    update: {},
    create: {
      nome: "Admin FestPass",
      email: "adm@alegriaKids.com.br",
      senha: senhaHash,
      role: "ADM",
      tenantId: tenant.id,
    },
  });

  await prisma.user.upsert({
    where: { email_tenantId: { email: "gerente@alegriaKids.com.br", tenantId: tenant.id } },
    update: {},
    create: {
      nome: "Marina Gerente",
      email: "gerente@alegriaKids.com.br",
      senha: senhaHash,
      role: "GERENTE",
      tenantId: tenant.id,
    },
  });

  const consultor = await prisma.user.upsert({
    where: { email_tenantId: { email: "consultor@alegriaKids.com.br", tenantId: tenant.id } },
    update: {},
    create: {
      nome: "Carlos Consultor",
      email: "consultor@alegriaKids.com.br",
      senha: senhaHash,
      role: "CONSULTOR",
      tenantId: tenant.id,
    },
  });

  const operador = await prisma.user.upsert({
    where: { email_tenantId: { email: "operador@alegriaKids.com.br", tenantId: tenant.id } },
    update: {},
    create: {
      nome: "João Operador",
      email: "operador@alegriaKids.com.br",
      senha: senhaHash,
      role: "OPERADOR",
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Usuários criados: ADM, Gerente, Consultor, Operador`);

  const hoje = new Date();
  const proximaFesta = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
  const festaPassada = new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000);

  const evento1 = await prisma.evento.create({
    data: {
      nome: "Festa da Sofia - Turma da Mônica",
      nomeAniversariante: "Sofia",
      idadeAniversariante: 5,
      dataEvento: proximaFesta,
      horarioInicio: "14:00",
      horarioFim: "18:00",
      descricao: "Festa temática Turma da Mônica para a Sofia",
      capacidade: 30,
      status: "ATIVO",
      tenantId: tenant.id,
      consultorId: consultor.id,
    },
  });

  const evento2 = await prisma.evento.create({
    data: {
      nome: "Festa do Pedro - Dinossauros",
      nomeAniversariante: "Pedro",
      idadeAniversariante: 7,
      dataEvento: festaPassada,
      horarioInicio: "15:00",
      horarioFim: "19:00",
      descricao: "Festa temática Dinossauros para o Pedro",
      capacidade: 25,
      status: "ENCERRADO",
      tenantId: tenant.id,
      consultorId: consultor.id,
    },
  });

  console.log(`✅ Eventos criados`);

  // Convidados para evento 1
  const convidados = [
    { nome: "Ana Lima", whats: "11911111111", email: "ana@email.com", nasc: "2020-03-15", crianca: "Beatriz" },
    { nome: "Roberto Silva", whats: "11922222222", email: "roberto@email.com", nasc: "2019-07-22", crianca: "Lucas" },
    { nome: "Carla Santos", whats: "11933333333", email: "carla@email.com", nasc: "2021-01-10", crianca: "Isabela" },
  ];

  for (const c of convidados) {
    const convidado = await prisma.convidado.create({
      data: {
        nomeResponsavel: c.nome,
        whatsapp: c.whats,
        email: c.email,
        qtdPulantes: 1,
        nomeAniversariante: c.crianca,
        dataNascimento: c.nasc,
        aceiteLgpd: true,
        eventoId: evento1.id,
      },
    });

    await prisma.qRCode.create({
      data: {
        codigo: uuidv4(),
        status: "PENDENTE",
        convidadoId: convidado.id,
        expiradoEm: proximaFesta,
      },
    });
  }

  // Convidados para evento 2 (encerrado, com check-ins)
  const convidadosPassados = [
    { nome: "Fernanda Alves", whats: "11944444444", email: "fer@email.com", nasc: "2018-05-20", crianca: "Guilherme" },
    { nome: "Marcos Rocha", whats: "11955555555", email: "marcos@email.com", nasc: "2017-11-30", crianca: "Vitória" },
  ];

  for (const c of convidadosPassados) {
    const convidado = await prisma.convidado.create({
      data: {
        nomeResponsavel: c.nome,
        whatsapp: c.whats,
        email: c.email,
        qtdPulantes: 2,
        nomeAniversariante: c.crianca,
        dataNascimento: c.nasc,
        aceiteLgpd: true,
        eventoId: evento2.id,
      },
    });

    const qr = await prisma.qRCode.create({
      data: {
        codigo: uuidv4(),
        status: "UTILIZADO",
        convidadoId: convidado.id,
        expiradoEm: festaPassada,
      },
    });

    await prisma.checkIn.create({
      data: {
        qrCodeId: qr.id,
        operadorId: operador.id,
        horario: festaPassada,
      },
    });
  }

  console.log(`✅ Convidados e QR Codes criados`);
  console.log(`\n🎉 Seed concluído!\n`);
  console.log(`📋 Credenciais de acesso:`);
  console.log(`   ADM:       adm@alegriaKids.com.br       / festpass123`);
  console.log(`   Gerente:   gerente@alegriaKids.com.br   / festpass123`);
  console.log(`   Consultor: consultor@alegriaKids.com.br / festpass123`);
  console.log(`   Operador:  operador@alegriaKids.com.br  / festpass123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
