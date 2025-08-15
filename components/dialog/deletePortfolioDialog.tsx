"use client"

import React from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface DeletePortfolioDialogProps {
    portfolioId: string;
    children: React.ReactNode;
    onDelete: () => void;
}

function DeletePortfolioDialog({ children, onDelete }: DeletePortfolioDialogProps) {
  return (
    <Dialog>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>포트폴리오 삭제</DialogTitle>
                <DialogDescription>
                  포트폴리오를 삭제하시겠습니까?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" className='shadow-none border-0'>취소</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button variant="destructive" onClick={onDelete}>삭제</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default DeletePortfolioDialog