const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

app.storageBlob('blobBackupTrigger', {
    path: 'assessment-data/{name}',
    connection: 'st270907283assessment_STORAGE',

    handler: async (blob, context) => {
        const blobName = context.triggerMetadata.name;

        context.log(`New blob detected: "${blobName}"`);
        context.log(`Source blob size: ${blob.length} bytes`);

        try {
            const backupConnectionString =
                process.env.BACKUP_STORAGE_CONNECTION;

            if (!backupConnectionString) {
                throw new Error(
                    'BACKUP_STORAGE_CONNECTION is not configured.'
                );
            }

            const blobServiceClient =
                BlobServiceClient.fromConnectionString(
                    backupConnectionString
                );

            const containerClient =
                blobServiceClient.getContainerClient('backup-data');

            const blockBlobClient =
                containerClient.getBlockBlobClient(blobName);

            context.log(`Backing up "${blobName}" to backup-data...`);

            await blockBlobClient.uploadData(blob);

            context.log(
                `Backup completed successfully: "${blobName}"`
            );

        } catch (error) {
            context.error(
                `Backup failed for "${blobName}":`,
                error
            );

            throw error;
        }
    }
});