"use client";

import { useForm } from "react-hook-form";


const FormPage = () => {
    const { register, watch } = useForm({
        defaultValues: { name: "" },
    });

    const name = watch("name");

    return (
        <>
            <input {...register("name")} />
            <p>Olá, {name || "visitante"}!</p>
        </>
    );
}

export default FormPage;