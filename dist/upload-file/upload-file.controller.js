"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const upload_file_service_1 = require("./upload-file.service");
const sample_dto_1 = require("./sample.dto");
let UploadFileController = class UploadFileController {
    constructor(uploadFileService) {
        this.uploadFileService = uploadFileService;
    }
    sayHello() {
        return this.uploadFileService.getHello();
    }
    uploadFile(body, file) {
        return {
            body,
            file: file.buffer.toString(),
        };
    }
};
exports.UploadFileController = UploadFileController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UploadFileController.prototype, "sayHello", null);
__decorate([
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, common_1.Post)('file'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sample_dto_1.SampleDto, Object]),
    __metadata("design:returntype", void 0)
], UploadFileController.prototype, "uploadFile", null);
exports.UploadFileController = UploadFileController = __decorate([
    (0, common_1.Controller)('upload-file'),
    __metadata("design:paramtypes", [upload_file_service_1.UploadFileService])
], UploadFileController);
//# sourceMappingURL=upload-file.controller.js.map