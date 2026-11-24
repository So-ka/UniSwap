import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CreateListingDto } from './dto/create-listing.dto';
import { MAX_PHOTO_BYTES } from './listing.constants';
import {
  ListingResponse,
  ListingsService,
  UPLOAD_DIR,
  UploadedPhoto,
} from './listings.service';

const PHOTO_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @UseGuards(SessionAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', { limits: { fileSize: MAX_PHOTO_BYTES, files: 1 } }),
  )
  async create(
    @Body() input: CreateListingDto,
    @Req() request: Request,
    @UploadedFile() photo?: UploadedPhoto,
  ): Promise<{ listing: ListingResponse }> {
    const listing = await this.listingsService.create(
      request.session.userId!,
      input,
      photo,
    );
    return { listing };
  }

  @Get('photos/:name')
  getPhoto(@Param('name') name: string, @Res() response: Response): void {
    if (!PHOTO_NAME.test(name)) {
      throw new NotFoundException();
    }

    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    response.sendFile(name, { root: UPLOAD_DIR }, (error) => {
      if (error && !response.headersSent) {
        response.status(404).json({ message: 'Photo not found.' });
      }
    });
  }
}
