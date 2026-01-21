import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    avatar?: string;
    rating: number;
}
export function TestimonialManager() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [testimonialToDelete, setTestimonialToDelete] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        content: '',
        rating: 5,
        avatar: ''
    });
    // Fetch testimonials
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/testimonials`);
                if (!response.ok) throw new Error('Failed to fetch testimonials');
                const data = await response.json();
                setTestimonials(data);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to load testimonials',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTestimonials();
    }, []);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleRatingChange = (rating: number) => {
        setFormData(prev => ({ ...prev, rating }));
    };
    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            content: '',
            rating: 5,
            avatar: ''
        });
        setEditingTestimonial(null);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingTestimonial
            ? `${API_BASE_URL}/api/admin/testimonials/${editingTestimonial.id}`
            : `${API_BASE_URL}/api/admin/testimonials`;
        const method = editingTestimonial ? 'PUT' : 'POST';
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Failed to save testimonial');
            const result = await response.json();

            if (editingTestimonial) {
                setTestimonials(testimonials.map(t => t.id === result.id ? result : t));
            } else {
                setTestimonials([result, ...testimonials]);
            }
            toast({
                title: 'Success',
                description: `Testimonial ${editingTestimonial ? 'updated' : 'created'} successfully`,
            });
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save testimonial',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteClick = (id: number) => {
        setTestimonialToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!testimonialToDelete) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/testimonials/${testimonialToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete testimonial');
            setTestimonials(testimonials.filter(t => t.id !== testimonialToDelete));
            toast({
                title: 'Success',
                description: 'Testimonial deleted successfully',
            });
            setDeleteDialogOpen(false);
            setTestimonialToDelete(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete testimonial',
                variant: 'destructive',
            });
        }
    };

    const filteredTestimonials = testimonials.filter(testimonial =>
        testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testimonial.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Skeleton className="h-10 w-full sm:w-96" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-6 space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Skeleton key={star} className="h-5 w-5 rounded-full" />
                                    ))}
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search testimonials..."
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                resetForm();
                                setIsDialogOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Testimonial
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <Input
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    placeholder="E.g., CEO at Company"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Avatar URL (optional)</label>
                                <Input
                                    name="avatar"
                                    value={formData.avatar}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="Share your experience or feedback..."
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingChange(star)}
                                            className={`text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingTestimonial ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Testimonial</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Are you sure you want to delete this testimonial? This action cannot be undone.</p>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="space-y-4">
                {filteredTestimonials.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {searchTerm ? 'No matching testimonials found' : 'No testimonials yet'}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTestimonials.map((testimonial) => (
                            <div key={testimonial.id} className="border rounded-lg p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        {testimonial.avatar ? (
                                            <Image
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                                height={12}
                                                width={12}
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
                                                {testimonial.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-medium">{testimonial.name}</h4>
                                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditingTestimonial(testimonial);
                                                    setFormData({
                                                        name: testimonial.name,
                                                        role: testimonial.role,
                                                        content: testimonial.content,
                                                        avatar: testimonial.avatar || '',
                                                        rating: testimonial.rating
                                                    });
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteClick(testimonial.id)}
                                                className="text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex">
                                        {Array(5).fill(0).map((_, i) => (
                                            <span
                                                key={i}
                                                className={`text-xl ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground">{testimonial.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}