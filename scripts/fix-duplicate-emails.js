const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicateEmails() {
    try {
        // Find all job seekers
        const allSeekers = await prisma.jobSeeker.findMany({
            orderBy: { id: 'asc' }
        });

        console.log(`Found ${allSeekers.length} job seekers`);

        // Group by email
        const emailGroups = {};
        allSeekers.forEach(seeker => {
            if (!emailGroups[seeker.email]) {
                emailGroups[seeker.email] = [];
            }
            emailGroups[seeker.email].push(seeker);
        });

        // Fix duplicates by appending ID to email
        for (const [email, seekers] of Object.entries(emailGroups)) {
            if (seekers.length > 1) {
                console.log(`\nFound ${seekers.length} duplicates for email: ${email}`);

                // Keep the first one with original email, update others
                for (let i = 1; i < seekers.length; i++) {
                    const newEmail = `${email.split('@')[0]}_${seekers[i].id}@${email.split('@')[1]}`;
                    console.log(`  Updating ID ${seekers[i].id}: ${email} -> ${newEmail}`);

                    await prisma.jobSeeker.update({
                        where: { id: seekers[i].id },
                        data: { email: newEmail }
                    });
                }
            }
        }

        console.log('\n✅ All duplicate emails fixed!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixDuplicateEmails();
