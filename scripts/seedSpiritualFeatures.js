/**
 * Seed data for spiritual features
 * This script creates sample data for testing the new spiritual features
 */

import prisma from '../src/config/database.js';

async function seedSpiritualFeatures() {
  try {
    console.log('🌱 Starting spiritual features seeding...');

    // Create sample thematic studies
    const studyFe = await prisma.estudoTematico.create({
      data: {
        titulo: 'Fortalecendo a Fé em Tempos Difíceis',
        descricao: 'Um estudo de 5 sessões sobre como manter e fortalecer a fé durante períodos de adversidade.',
        categoria: 'fe',
        tempoEstimado: 150, // 30 min per session
        sessoes: {
          create: [
            {
              numero: 1,
              titulo: 'O que é a Fé?',
              conteudo: 'Nesta primeira sessão, exploraremos o conceito bíblico de fé e sua importância em nossa jornada espiritual.',
              versiculo: 'Hebreus 11:1 - "Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não veem."',
              reflexao: '1. Como você definiria fé em suas próprias palavras? 2. Quais situações testaram sua fé recentemente? 3. Como a definição bíblica de fé se aplica à sua vida atual?',
            },
            {
              numero: 2,
              titulo: 'Exemplos de Fé na Bíblia',
              conteudo: 'Estudaremos personagens bíblicos que demonstraram fé extraordinária em momentos desafiadores.',
              versiculo: 'Hebreus 11:6 - "Ora, sem fé é impossível agradar-lhe; porque é necessário que aquele que se aproxima de Deus creia que ele existe, e que é galardoador dos que o buscam."',
              reflexao: '1. Qual personagem bíblico mais inspira sua fé? 2. Que lições práticas você pode extrair desses exemplos? 3. Como aplicar essa fé em suas circunstâncias atuais?',
            },
            {
              numero: 3,
              titulo: 'Fé em Meio às Tribulações',
              conteudo: 'Aprenderemos como manter a fé quando enfrentamos dificuldades e sofrimentos.',
              versiculo: 'Romanos 5:3-4 - "E não somente isto, mas também nos gloriamos nas tribulações; sabendo que a tribulação produz a paciência, E a paciência a experiência, e a experiência a esperança."',
              reflexao: '1. Como as tribulações podem fortalecer nossa fé? 2. Que estratégias práticas você usa para manter a fé em tempos difíceis? 3. Como você pode encorajar outros em suas lutas?',
            },
            {
              numero: 4,
              titulo: 'Crescendo na Fé',
              conteudo: 'Exploraremos maneiras práticas de nutrir e desenvolver nossa fé continuamente.',
              versiculo: 'Romanos 10:17 - "De sorte que a fé é pelo ouvir, e o ouvir pela palavra de Deus."',
              reflexao: '1. Quais disciplinas espirituais fortalecem sua fé? 2. Como a Palavra de Deus tem impactado sua fé? 3. Que passos práticos você pode tomar para crescer na fé?',
            },
            {
              numero: 5,
              titulo: 'Vivendo pela Fé',
              conteudo: 'Concluiremos aprendendo como aplicar nossa fé no dia a dia e ser testemunhas vivas do poder de Deus.',
              versiculo: '2 Coríntios 5:7 - "Porque andamos por fé, e não por vista."',
              reflexao: '1. Como você pode viver mais pela fé e menos pelas circunstâncias? 2. De que formas sua fé pode impactar outros ao seu redor? 3. Quais são seus próximos passos na jornada da fé?',
            },
          ],
        },
      },
    });

    const studySabedoria = await prisma.estudoTematico.create({
      data: {
        titulo: 'Buscando a Sabedoria Divina',
        descricao: 'Um estudo de 4 sessões sobre como buscar e aplicar a sabedoria de Deus em nossa vida diária.',
        categoria: 'sabedoria',
        tempoEstimado: 120, // 30 min per session
        sessoes: {
          create: [
            {
              numero: 1,
              titulo: 'O Temor do Senhor é o Princípio da Sabedoria',
              conteudo: 'Compreenderemos o que significa temer ao Senhor e como isso se relaciona com a verdadeira sabedoria.',
              versiculo: 'Provérbios 9:10 - "O temor do Senhor é o princípio da sabedoria, e a ciência do Santo a prudência."',
              reflexao: '1. O que significa "temer ao Senhor" em termos práticos? 2. Como o temor do Senhor influencia suas decisões? 3. Que diferença você vê entre sabedoria humana e divina?',
            },
            {
              numero: 2,
              titulo: 'Pedindo Sabedoria a Deus',
              conteudo: 'Aprenderemos como buscar a sabedoria divina através da oração e comunhão com Deus.',
              versiculo: 'Tiago 1:5 - "E, se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente, e o não lança em rosto, e ser-lhe-á dada."',
              reflexao: '1. Com que frequência você pede sabedoria a Deus? 2. Como você reconhece quando Deus está lhe dando sabedoria? 3. Que decisões importantes você precisa de sabedoria divina?',
            },
            {
              numero: 3,
              titulo: 'Sabedoria nas Palavras e Ações',
              conteudo: 'Estudaremos como aplicar a sabedoria divina em nosso falar e agir cotidiano.',
              versiculo: 'Provérbios 16:24 - "Palavras suaves são como favos de mel, doces para a alma e medicina para os ossos."',
              reflexao: '1. Como suas palavras refletem sabedoria ou falta dela? 2. Que mudanças você pode fazer para agir com mais sabedoria? 3. Como a sabedoria pode melhorar seus relacionamentos?',
            },
            {
              numero: 4,
              titulo: 'Compartilhando Sabedoria com Outros',
              conteudo: 'Concluiremos aprendendo como ser canal de sabedoria divina para outros.',
              versiculo: 'Provérbios 27:17 - "Ferro com ferro se afia, assim o homem afia o rosto do seu próximo."',
              reflexao: '1. Como você pode ajudar outros a crescer em sabedoria? 2. Quem são as pessoas sábias em sua vida? 3. Que legado de sabedoria você quer deixar?',
            },
          ],
        },
      },
    });

    console.log('✅ Estudos temáticos criados com sucesso!');
    console.log(`- Estudo de Fé: ${studyFe.id}`);
    console.log(`- Estudo de Sabedoria: ${studySabedoria.id}`);

    console.log('🌱 Spiritual features seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding spiritual features:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
seedSpiritualFeatures();