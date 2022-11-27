import {downloadSubmissions} from "../src/downloader";
import {GoogleApi} from "dt-types";
import {submissions} from './downloader-test-data'
import { GoogleClassroom } from '../src/classroom-api';
import {GoogleDrive} from "../src/google-api";
import {Arg, Substitute} from '@fluffy-spoon/substitute';
import { expect } from 'chai';

describe('testing function to download submissions', () => {
    it('sample', () => {
        const pathToStore = './temp_output'
        const drive = Substitute.for<GoogleDrive>();
        const classroom = Substitute.for<GoogleClassroom>();
        const api: GoogleApi = {
            drive: drive,
            classroom: classroom
        }
        // ეს საჭიროა იმიტომ რომ submissions ჯერ არაა ინტერფეისად გატანილი
        // @ts-ignore
        classroom.getSubmissions('დავალება 3').resolves(submissions)
        const fileIds = submissions.map(s => s.attachment.id)
        for (let id of fileIds) {
            drive.saveFile(id, Arg.any()).resolves(id)
        }

        return downloadSubmissions(api, {hwName: 'დავალება 3', pathToStore: pathToStore})
            .then(paths => expect(paths.sort()).eql(fileIds.sort()))
    })
})
