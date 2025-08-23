// server/utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

export interface CloudinaryUploadResult {
    public_id: string
    secure_url: string
    width: number
    height: number
    format: string
    resource_type: string
    bytes: number
    url: string
    created_at: string
}

export interface UploadOptions {
    folder?: string
    public_id?: string
    overwrite?: boolean
    resource_type?: 'image' | 'video' | 'raw' | 'auto'
    transformation?: {
        width?: number
        height?: number
        crop?: string
        quality?: string | number
        format?: string
    }
    tags?: string[]
}

export class CloudinaryService {
    // Upload image from buffer
    static async uploadFromBuffer(
        buffer: Buffer,
        options: UploadOptions = {}
    ): Promise<CloudinaryUploadResult> {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                resource_type: options.resource_type || 'image',
                folder: options.folder || 'rukun-app',
                overwrite: options.overwrite ?? true,
                public_id: options.public_id,
                tags: options.tags || [],
                transformation: options.transformation,
            }

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        reject(error)
                    } else if (result) {
                        resolve(result as CloudinaryUploadResult)
                    } else {
                        reject(new Error('Upload failed with no result'))
                    }
                }
            ).end(buffer)
        })
    }

    // Upload image from file path
    static async uploadFromPath(
        filePath: string,
        options: UploadOptions = {}
    ): Promise<CloudinaryUploadResult> {
        const uploadOptions = {
            resource_type: options.resource_type || 'image',
            folder: options.folder || 'rukun-app',
            overwrite: options.overwrite ?? true,
            public_id: options.public_id,
            tags: options.tags || [],
            transformation: options.transformation,
        }

        return cloudinary.uploader.upload(filePath, uploadOptions) as Promise<CloudinaryUploadResult>
    }

    // Upload avatar with standard transformations
    static async uploadAvatar(
        buffer: Buffer,
        userId: string,
        options: Partial<UploadOptions> = {}
    ): Promise<CloudinaryUploadResult> {
        const avatarOptions: UploadOptions = {
            folder: 'rukun-app/avatars',
            public_id: `avatar_${userId}_${Date.now()}`,
            overwrite: true,
            transformation: {
                width: 400,
                height: 400,
                crop: 'fill',
                quality: 'auto:good',
                format: 'webp'
            },
            tags: ['avatar', 'user', userId],
            ...options
        }

        return this.uploadFromBuffer(buffer, avatarOptions)
    }

    // Upload RT logo
    static async uploadRtLogo(
        buffer: Buffer,
        rtId: string,
        options: Partial<UploadOptions> = {}
    ): Promise<CloudinaryUploadResult> {
        const logoOptions: UploadOptions = {
            folder: 'rukun-app/rt-logos',
            public_id: `rt_logo_${rtId}_${Date.now()}`,
            overwrite: true,
            transformation: {
                width: 800,
                height: 600,
                crop: 'fit',
                quality: 'auto:good',
                format: 'webp'
            },
            tags: ['logo', 'rt', rtId],
            ...options
        }

        return this.uploadFromBuffer(buffer, logoOptions)
    }

    // Upload document/proof images
    static async uploadDocument(
        buffer: Buffer,
        type: 'transaction' | 'payment' | 'document',
        entityId: string,
        options: Partial<UploadOptions> = {}
    ): Promise<CloudinaryUploadResult> {
        const documentOptions: UploadOptions = {
            folder: `rukun-app/${type}s`,
            public_id: `${type}_${entityId}_${Date.now()}`,
            overwrite: false,
            transformation: {
                width: 1200,
                height: 1600,
                crop: 'limit',
                quality: 'auto:good',
                format: 'webp'
            },
            tags: [type, entityId],
            ...options
        }

        return this.uploadFromBuffer(buffer, documentOptions)
    }

    // Delete image by public_id
    static async deleteImage(publicId: string): Promise<{ result: string }> {
        return cloudinary.uploader.destroy(publicId)
    }

    // Delete multiple images
    static async deleteImages(publicIds: string[]): Promise<{ deleted: Record<string, string> }> {
        return cloudinary.api.delete_resources(publicIds)
    }

    // Get image info
    static async getImageInfo(publicId: string): Promise<any> {
        return cloudinary.api.resource(publicId)
    }

    // Generate transformation URL
    static generateUrl(
        publicId: string,
        transformation?: {
            width?: number
            height?: number
            crop?: string
            quality?: string | number
            format?: string
        }
    ): string {
        return cloudinary.url(publicId, {
            secure: true,
            transformation: transformation || {}
        })
    }

    // Get optimized avatar URL
    static getAvatarUrl(
        publicId: string,
        size: 'sm' | 'md' | 'lg' | 'xl' = 'md'
    ): string {
        const sizeMap = {
            sm: { width: 32, height: 32 },
            md: { width: 64, height: 64 },
            lg: { width: 128, height: 128 },
            xl: { width: 256, height: 256 }
        }

        return cloudinary.url(publicId, {
            secure: true,
            transformation: {
                ...sizeMap[size],
                crop: 'fill',
                quality: 'auto:good',
                format: 'webp'
            }
        })
    }

    // Clean up old uploads (for maintenance)
    static async cleanupOldUploads(
        folder: string,
        olderThanDays: number = 30
    ): Promise<{ deleted: Record<string, string> }> {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

        // Get resources older than cutoff date
        const resources = await cloudinary.search
            .expression(`folder:${folder} AND created_at:<${cutoffDate.toISOString()}`)
            .max_results(500)
            .execute()

        if (resources.resources.length === 0) {
            return { deleted: {} }
        }

        const publicIds = resources.resources.map((resource: any) => resource.public_id)
        return this.deleteImages(publicIds)
    }

    // Validate Cloudinary configuration
    static validateConfig(): { valid: boolean; missing: string[] } {
        const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
        const missing = required.filter(key => !process.env[key])

        return {
            valid: missing.length === 0,
            missing
        }
    }

    // Health check
    static async healthCheck(): Promise<{ status: string; timestamp: string }> {
        try {
            await cloudinary.api.ping()
            return {
                status: 'healthy',
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            throw new Error('Cloudinary health check failed')
        }
    }
}

// Helper function to convert File to Buffer (for form data)
export async function fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer()
    return Buffer.from(arrayBuffer)
}

// Helper function to validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        return { valid: false, error: 'File size must be less than 5MB' }
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'File must be JPEG, PNG, or WebP' }
    }

    return { valid: true }
}

// Export the main service
export default CloudinaryService
