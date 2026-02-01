import { prisma } from './src/config/db.js';

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
        .replace(/\s+/g, '-')             // Replace spaces with -
        .replace(/-+/g, '-')              // Replace multiple - with single -
        .trim();
};

async function generateSlugs() {
    const establishments = await prisma.establishmentProfile.findMany({
        where: { slug: null },
        select: { user_id: true, name: true }
    });

    console.log(`Found ${establishments.length} establishments without slugs`);

    for (const est of establishments) {
        const baseSlug = generateSlug(est.name);
        let slug = baseSlug;
        let counter = 1;

        // Ensure unique slug
        while (await prisma.establishmentProfile.findFirst({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        await prisma.establishmentProfile.update({
            where: { user_id: est.user_id },
            data: { slug }
        });

        console.log(`Updated: ${est.name} -> ${slug}`);
    }

    console.log('Done!');
    await prisma.$disconnect();
}

generateSlugs();
