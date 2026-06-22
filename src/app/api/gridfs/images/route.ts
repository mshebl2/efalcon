import { NextRequest, NextResponse } from 'next/server';
import { GridFSUtils } from '@/lib/gridfs';
import { withAuth, authenticateAdmin } from '@/lib/auth';

// GET - List all images with metadata
export async function GET(request: NextRequest) {
  try {
    const images = await GridFSUtils.listFiles();
    
    // Check if request is from an authenticated admin
    const isAdmin = authenticateAdmin(request) !== null;

    // Filter active images (if not admin) and sort by order
    const filteredImages = isAdmin
      ? images
      : images.filter(img => img.metadata?.isActive !== false);

    const sortedImages = filteredImages.sort((a, b) => (a.metadata?.order || 0) - (b.metadata?.order || 0));

    const response = NextResponse.json({
      success: true,
      data: sortedImages.map(img => ({
        _id: img._id.toString(),
        filename: img.filename,
        contentType: img.contentType,
        length: img.length,
        uploadDate: img.uploadDate,
        metadata: img.metadata
      }))
    });

    // Add cache headers - short cache to ensure fresh data on production
    response.headers.set('Cache-Control', 'public, s-maxage=60, max-age=60, stale-while-revalidate=120');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    // Prevent caching of stale data
    response.headers.set('Vary', 'Accept');
    
    return response;

  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list images'
    }, { status: 500 });
  }
}

// POST - Upload new image (Admin only)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const titleAr = formData.get('titleAr') as string;
    const description = formData.get('description') as string;
    const descriptionAr = formData.get('descriptionAr') as string;
    const order = parseInt(formData.get('order') as string);
    const isActive = formData.get('isActive') === 'true';
    const showTitle = formData.get('showTitle') === 'true';
    const showDescription = formData.get('showDescription') === 'true';
    const page = formData.get('page') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    if (isNaN(order)) {
      return NextResponse.json({
        success: false,
        error: 'Order is required'
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = await GridFSUtils.uploadFile(
      buffer,
      file.name,
      file.type,
      {
        title: title || file.name,
        titleAr: titleAr || '',
        description: description || '',
        descriptionAr: descriptionAr || '',
        order,
        isActive,
        showTitle,
        showDescription,
        page: page || 'home'
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        _id: fileId,
        filename: file.name,
        contentType: file.type,
        metadata: { 
          title: title || file.name, 
          titleAr: titleAr || '', 
          description: description || '', 
          descriptionAr: descriptionAr || '', 
          order, 
          isActive, 
          showTitle, 
          showDescription, 
          page: page || 'home' 
        }
      },
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload image'
    }, { status: 500 });
  }
});

// PUT - Update image metadata or replace image file (Admin only)
// Handles both FormData (with file) and JSON (metadata only)
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    let _id: string;
    let title: string | undefined;
    let titleAr: string | undefined;
    let description: string | undefined;
    let descriptionAr: string | undefined;
    let order: number | undefined;
    let isActive: boolean | undefined;
    let showTitle: boolean | undefined;
    let showDescription: boolean | undefined;
    let page: string | undefined;
    let file: File | null = null;

    // Check if request is FormData or JSON
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      _id = formData.get('_id') as string;
      file = formData.get('file') as File | null;
      title = formData.get('title') as string | null || undefined;
      titleAr = formData.get('titleAr') as string | null || undefined;
      description = formData.get('description') as string | null || undefined;
      descriptionAr = formData.get('descriptionAr') as string | null || undefined;
      const orderStr = formData.get('order') as string | null;
      order = orderStr ? parseInt(orderStr) : undefined;
      const isActiveStr = formData.get('isActive') as string | null;
      isActive = isActiveStr === 'true' ? true : isActiveStr === 'false' ? false : undefined;
      const showTitleStr = formData.get('showTitle') as string | null;
      showTitle = showTitleStr === 'true' ? true : showTitleStr === 'false' ? false : undefined;
      const showDescriptionStr = formData.get('showDescription') as string | null;
      showDescription = showDescriptionStr === 'true' ? true : showDescriptionStr === 'false' ? false : undefined;
      page = formData.get('page') as string | null || undefined;
    } else {
      // JSON request
      const body = await request.json();
      _id = body._id;
      title = body.title;
      titleAr = body.titleAr;
      description = body.description;
      descriptionAr = body.descriptionAr;
      order = body.order;
      isActive = body.isActive;
      showTitle = body.showTitle;
      showDescription = body.showDescription;
      page = body.page;
    }

    if (!_id) {
      return NextResponse.json({
        success: false,
        error: 'Image ID is required'
      }, { status: 400 });
    }

    const { ObjectId } = await import('mongodb');

    // If a file is provided, delete old image and upload new one
    if (file) {
      // Delete the old image
      await GridFSUtils.deleteFile(_id);

      // Upload new image with updated metadata
      const buffer = Buffer.from(await file.arrayBuffer());
      const metadata: any = {};
      if (title !== undefined) metadata.title = title || file.name;
      if (titleAr !== undefined) metadata.titleAr = titleAr || '';
      if (description !== undefined) metadata.description = description || '';
      if (descriptionAr !== undefined) metadata.descriptionAr = descriptionAr || '';
      if (order !== undefined) metadata.order = order;
      if (isActive !== undefined) metadata.isActive = isActive;
      if (showTitle !== undefined) metadata.showTitle = showTitle;
      if (showDescription !== undefined) metadata.showDescription = showDescription;
      if (page !== undefined) metadata.page = page;

      // Get existing metadata to preserve values not being updated
      const existingImages = await GridFSUtils.listFiles();
      const existing = existingImages.find(img => img._id.toString() === _id);
      if (existing && existing.metadata) {
        // Preserve existing metadata if not provided
        if (title === undefined) metadata.title = existing.metadata.title || file.name;
        if (titleAr === undefined) metadata.titleAr = existing.metadata.titleAr || '';
        if (description === undefined) metadata.description = existing.metadata.description || '';
        if (descriptionAr === undefined) metadata.descriptionAr = existing.metadata.descriptionAr || '';
        if (order === undefined) metadata.order = existing.metadata.order || 1;
        if (isActive === undefined) metadata.isActive = existing.metadata.isActive !== false;
        if (showTitle === undefined) metadata.showTitle = existing.metadata.showTitle !== false;
        if (showDescription === undefined) metadata.showDescription = existing.metadata.showDescription !== false;
        if (page === undefined) metadata.page = existing.metadata.page || 'home';
      } else {
        // Defaults if no existing metadata
        if (!metadata.title) metadata.title = file.name;
        if (metadata.titleAr === undefined) metadata.titleAr = '';
        if (metadata.description === undefined) metadata.description = '';
        if (metadata.descriptionAr === undefined) metadata.descriptionAr = '';
        if (metadata.order === undefined) metadata.order = 1;
        if (metadata.isActive === undefined) metadata.isActive = true;
        if (metadata.showTitle === undefined) metadata.showTitle = true;
        if (metadata.showDescription === undefined) metadata.showDescription = true;
        if (metadata.page === undefined) metadata.page = 'home';
      }

      const newFileId = await GridFSUtils.uploadFile(
        buffer,
        file.name,
        file.type,
        metadata
      );

      return NextResponse.json({
        success: true,
        message: 'Image replaced successfully',
        data: {
          _id: newFileId,
          filename: file.name,
          contentType: file.type,
          metadata
        }
      });
    } else {
      // Metadata-only update
      const clientPromise = (await import('@/lib/mongodb')).default;
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'petrowebsite');
      const filesCollection = db.collection('images.files');

      // Update the metadata in the files collection
      const updateFields: any = {};
      if (title !== undefined) updateFields['metadata.title'] = title;
      if (titleAr !== undefined) updateFields['metadata.titleAr'] = titleAr;
      if (description !== undefined) updateFields['metadata.description'] = description;
      if (descriptionAr !== undefined) updateFields['metadata.descriptionAr'] = descriptionAr;
      if (order !== undefined) updateFields['metadata.order'] = order;
      if (isActive !== undefined) updateFields['metadata.isActive'] = isActive;
      if (showTitle !== undefined) updateFields['metadata.showTitle'] = showTitle;
      if (showDescription !== undefined) updateFields['metadata.showDescription'] = showDescription;
      if (page !== undefined) updateFields['metadata.page'] = page;

      const result = await filesCollection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({
          success: false,
          error: 'Image not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Image metadata updated successfully',
        data: { _id, ...updateFields }
      });
    }

  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update image: ' + (error as Error).message
    }, { status: 500 });
  }
});

// DELETE - Delete image (Admin only)
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) {
      return NextResponse.json({
        success: false,
        error: 'Image ID is required'
      }, { status: 400 });
    }

    const deleted = await GridFSUtils.deleteFile(_id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Image not found or could not be deleted'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete image'
    }, { status: 500 });
  }
});
