package com.happyprovision.store.service;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    private final GridFsTemplate gridFsTemplate;

    public FileStorageService(GridFsTemplate gridFsTemplate) {
        this.gridFsTemplate = gridFsTemplate;
    }

    public String store(MultipartFile file) throws IOException {
        if (file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        String original = file.getOriginalFilename();
        String ext = ".jpg";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }

        String filename = System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + ext;
        ObjectId id = gridFsTemplate.store(file.getInputStream(), filename, file.getContentType());
        return "/api/images/" + id.toHexString();
    }

    public GridFsResource getImage(String id) {
        if (id == null || !ObjectId.isValid(id)) {
            return null;
        }
        try {
            return gridFsTemplate.getResource(id);
        } catch (Exception e) {
            return null;
        }
    }
}
