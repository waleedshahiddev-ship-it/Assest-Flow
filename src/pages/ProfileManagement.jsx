import React from 'react';
import { useUser } from '@clerk/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFullUserProfile, updateProfile } from '../services/apiProfileManagement';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import Loader from '../ui/Loader';

const ProfileManagement = () => {
  const { user: clerkUser } = useUser();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['userProfile', clerkUser?.id],
    queryFn: () => getFullUserProfile(clerkUser?.id),
    enabled: !!clerkUser?.id,
  });

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  const mutation = useMutation({
    mutationFn: (updates) => updateProfile(clerkUser.id, data.role, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile', clerkUser?.id]);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });

  React.useEffect(() => {
    if (data) {
      const defaultValues = {
        full_name: data.user.full_name || '',
        email: data.user.email || '',
        role: data.role || '',
        company_name: data.user.companies?.name || '',
        industry: data.user.companies?.industry || '',
        size: data.user.companies?.size || '',
        website: data.user.companies?.website || '',
        company_location: data.user.companies?.location || '',
      };

      if (data.role === 'employer' || data.role === 'admin' || data.role === 'manager') {
          defaultValues.phone = data.profile?.phone || '';
      }
      
      if (data.role === 'admin') {
          defaultValues.title = data.profile?.title || '';
      }

      if (data.role === 'manager') {
          defaultValues.department = data.profile?.department || '';
          defaultValues.manager_level = data.profile?.manager_level || '';
      }

      if (data.role === 'employee') {
          defaultValues.job_title = data.profile?.job_title || '';
          defaultValues.department = data.profile?.department || '';
          defaultValues.employee_number = data.profile?.employee_number || '';
          defaultValues.location = data.profile?.location || '';
          defaultValues.manager_name = data.profile?.users?.full_name || '';
      }

      reset(defaultValues);
    }
  }, [data, reset]);

  if (isLoading) return <Loader />;
  if (isError) return <div className="p-8 text-rose-500">Error loading profile</div>;
  if (!data) return <Loader />;

  const onSubmit = (values) => {
    // Filter out read-only fields for the update mutation
    const updatePayload = {
        full_name: values.full_name
    };

    if (data.role === 'employer') {
        updatePayload.phone = values.phone;
        updatePayload.company_name = values.company_name;
        updatePayload.industry = values.industry;
        updatePayload.size = values.size;
        updatePayload.website = values.website;
        updatePayload.company_location = values.company_location;
    } else if (data.role === 'admin') {
        updatePayload.phone = values.phone;
        updatePayload.title = values.title;
    } else if (data.role === 'manager') {
        updatePayload.phone = values.phone;
        updatePayload.manager_level = values.manager_level;
    } else if (data.role === 'employee') {
        updatePayload.job_title = values.job_title;
        updatePayload.location = values.location;
    }

    mutation.mutate(updatePayload);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-lg text-slate-500 font-medium">Manage your personal information and profile settings.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information Card */}
        <Card className="border-none shadow-2xl ring-1 ring-slate-100 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                    {data.user.full_name?.charAt(0) || clerkUser?.firstName?.charAt(0)}
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Personal Information</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Update your name and contact details.</CardDescription>
                </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Full Name</Label>
                <Input 
                    id="full_name" 
                    {...register('full_name', { required: 'Full name is required' })} 
                    className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 font-medium transition-all"
                />
                {errors.full_name && <span className="text-red-500 text-sm">{errors.full_name.message}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-slate-400 uppercase tracking-wider">Email Address</Label>
                <Input 
                    id="email" 
                    disabled 
                    {...register('email')} 
                    className="h-12 rounded-xl bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-bold text-slate-400 uppercase tracking-wider">Assigned Role</Label>
                <Input 
                    id="role" 
                    disabled 
                    {...register('role')} 
                    className="h-12 rounded-xl bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed font-medium capitalize"
                />
              </div>
            </div>

            {/* Role Specific Personal Fields */}
            {(data.role === 'employer' || data.role === 'admin' || data.role === 'manager') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Phone Number</Label>
                    <Input id="phone" {...register('phone', { pattern: { value: /^\+?[\d\s\-\(\)]+$/, message: 'Invalid phone number format' } })} className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 font-medium transition-all" />
                    {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
                </div>
              </div>
            )}

            {data.role === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Job Title</Label>
                    <Input id="title" {...register('title')} className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 font-medium transition-all" />
                </div>
              </div>
            )}

            {data.role === 'manager' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-bold text-slate-400 uppercase tracking-wider">Department</Label>
                    <Input id="department" disabled {...register('department')} className="h-12 rounded-xl bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed font-medium" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="manager_level" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Manager Level</Label>
                    <Input id="manager_level" {...register('manager_level')} className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 font-medium transition-all" />
                </div>
              </div>
            )}

            {data.role === 'employee' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label htmlFor="job_title" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Job Title</Label>
                    <Input id="job_title" {...register('job_title')} className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 font-medium transition-all" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-bold text-slate-400 uppercase tracking-wider">Department</Label>
                    <Input id="department" disabled {...register('department')} className="h-12 rounded-xl bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed font-medium" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="employee_number" className="text-sm font-bold text-slate-400 uppercase tracking-wider">Employee #</Label>
                    <Input id="employee_number" disabled {...register('employee_number')} className="h-12 rounded-xl bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed font-medium" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="manager_name" className="text-sm font-bold text-slate-400 uppercase tracking-wider">Manager</Label>
                    <Input id="manager_name" disabled {...register('manager_name')} className="h-12 rounded-xl bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed font-medium" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Work Location</Label>
                    <Input id="location" {...register('location')} className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 font-medium transition-all" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Information Card - Only for Employers */}
        {data.role === 'employer' && (
          <Card className="border-none shadow-2xl ring-1 ring-slate-100 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-8">
              <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <div>
                      <CardTitle className="text-2xl font-bold text-slate-900">Company Information</CardTitle>
                      <CardDescription className="text-slate-500 font-medium">Manage your company details and settings.</CardDescription>
                  </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Company Name</Label>
                  <Input id="company_name" {...register('company_name', { required: data.role === 'employer' ? 'Company name is required' : false })} className="h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-medium transition-all" />
                  {errors.company_name && <span className="text-red-500 text-sm">{errors.company_name.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Industry</Label>
                  <Input id="industry" {...register('industry')} className="h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-medium transition-all" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Company Size</Label>
                  <Input id="size" {...register('size')} className="h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-medium transition-all" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Website</Label>
                  <Input id="website" {...register('website', { pattern: { value: /^https?:\/\/.+/, message: 'Invalid URL format' } })} className="h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-medium transition-all" />
                  {errors.website && <span className="text-red-500 text-sm">{errors.website.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_location" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Company Location</Label>
                  <Input id="company_location" {...register('company_location')} className="h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 font-medium transition-all" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button 
              type="button" 
              variant="outline" 
              onClick={() => reset()} 
              disabled={!isDirty || mutation.isPending}
              className="h-12 rounded-xl px-8 border-slate-200 text-slate-600 font-bold transition-all"
          >
            Reset Changes
          </Button>
          <Button 
              type="submit" 
              disabled={!isDirty || mutation.isPending}
              className="h-12 rounded-xl px-10 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-bold transition-all disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileManagement;
